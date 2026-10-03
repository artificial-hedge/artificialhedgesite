"""Small, deterministic patches for the captured HydraDB browser modules.

``patch_module`` receives an original source URL and the full source-to-local URL
mapping. It operates on JavaScript only. Framer CMS binary bytes must be copied
without passing through this helper or any textual asset replacement.
"""

from __future__ import annotations

import json
import re
from urllib.parse import unquote, urljoin, urlsplit


_CMS_URL = re.compile(
    r"new\s+URL\(\s*(?P<relative_quote>[`\"'])"
    r"(?P<relative>[^`\"']+\.framercms)(?P=relative_quote)\s*,\s*"
    r"(?P<base_quote>[`\"'])(?P<base>[^`\"']+)(?P=base_quote)\s*\)"
    r"\s*\.href\s*\.replace\(\s*(?P<modules_quote>[`\"'])/modules/"
    r"(?P=modules_quote)\s*,\s*(?P<cms_quote>[`\"'])/cms/(?P=cms_quote)\s*\)"
)

# The five collection modules have the same compact binary-record decoder.
# Restrict the match to readUint16/readString/typed-read object construction.
_RECORD_DECODER = re.compile(
    r"function\s+[$\w]+\((?P<reader>[$\w]+)\)\{"
    r"let\s+(?P<record>[$\w]+)=\{\},[$\w]+="
    r"(?P=reader)\.readUint16\(\);"
    r"for\([^{}]*\)\{[^{}]*\.readString\(\);"
    r"[^{}]*\.read\((?P=reader)\)[^{}]*\}"
    r"return\s+(?P=record)\}"
)

# The three small taxonomy collections use a record class rather than the
# two large collections' plain-object reader. Localize its data accessor.
_RECORD_ACCESSOR = re.compile(
    r"getData\(\)\{let\s+(?P<record>[$\w]+)=\{\};"
    r"for\(let\[[$\w]+,[$\w]+\]of\s+this\.fields\)"
    r"(?P=record)\[[$\w]+\]=[$\w]+;return\s+(?P=record)\}"
)


def _mapped_path(value):
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return value.get("url") or value.get("local_url") or value.get("local_path")
    return None


def patch_module(code: str, source_url: str, mapping: dict) -> str:
    """Return patched JS without I/O, mutation of the mapping, or shared state.

    Mapping values are normally local root paths. Captured asset metadata objects
    with ``url``, ``local_url`` or ``local_path`` are also accepted. The localizer
    can call this after its literal URL rewrite: reverse mapping recovers any
    already-rewritten CMS base URL before resolving the original binary URL.
    """
    if source_url.endswith(".framercms"):
        raise ValueError("CMS binary content must remain byte-exact")

    paths = {url: path for url, value in mapping.items() if (path := _mapped_path(value))}
    reverse = {path: url for url, path in paths.items()}
    cms_by_name = {}
    for url, path in paths.items():
        if urlsplit(url).path.endswith(".framercms"):
            cms_by_name.setdefault(unquote(urlsplit(url).path.rsplit("/", 1)[-1]), path)

    def local_dynamic_import(match):
        specifier = match["specifier"]
        if "${" in specifier:
            return match[0]
        path = paths.get(urljoin(source_url, specifier))
        if not path:
            return match[0]
        return f"import({json.dumps(path)})"

    # Vite does not process captured public modules. Backtick lazy imports must
    # be resolved explicitly, just like the localizer's static import rewrite.
    code = re.sub(
        r"\bimport\s*\(\s*(?P<quote>[`\"'])(?P<specifier>[^`\"']+)"
        r"(?P=quote)\s*\)",
        local_dynamic_import,
        code,
    )

    def local_cms(match):
        relative = match["relative"]
        base = reverse.get(match["base"], match["base"])
        original = urljoin(base, relative).replace("/modules/", "/cms/")
        path = paths.get(original)
        if not path:
            # Downloaded /modules/ aliases may redirect to the canonical /cms/.
            path = paths.get(urljoin(base, relative))
        if not path:
            path = cms_by_name.get(unquote(relative.rsplit("/", 1)[-1]))
        if not path:
            raise ValueError(f"Missing local CMS binary mapping: {original}")
        return f"new URL({json.dumps(path)},location.origin).href"

    code = _CMS_URL.sub(local_cms, code)

    def local_record(match):
        original = match[0]
        record = match["record"]
        return original.rsplit("return", 1)[0] + (
            f"return globalThis.__hydraLocalizeValue?.({record})??{record}}}"
        )

    code = _RECORD_DECODER.sub(local_record, code)
    code = _RECORD_ACCESSOR.sub(local_record, code)

    name = urlsplit(source_url).path.rsplit("/", 1)[-1]
    if name.startswith("script_main."):
        code = re.sub(
            r"siteCanonicalURL\s*:\s*([`\"'])[^`\"']*\1",
            "siteCanonicalURL:location.origin",
            code,
        )
        # The captured editor is optional and does not belong in a local clone.
        code = re.sub(
            r"EditorBar:.*?,adaptLayoutToTextDirection:",
            "EditorBar:void 0,adaptLayoutToTextDirection:",
            code,
            flags=re.DOTALL,
        )

    if name.startswith("eRvDxNVcwfeK5KnVIpdtgKBXVlR6X4iguklpUg-VCBg."):
        # This module's public contract is consumed by the Framer route loader.
        # Empty snippets keep route transitions intact without source telemetry.
        return (
            "async function getSnippets(){return{bodyEnd:[],bodyStart:[],headEnd:[],headStart:[]}};"
            "const snippetsSorting={bodyEnd:[],bodyStart:[],headEnd:[],headStart:[]};"
            "const __FramerMetadata__={exports:{getSnippets:{type:'function',annotations:"
            "{framerContractVersion:'1'}},snippetsSorting:{type:'variable',annotations:"
            "{framerContractVersion:'1'}},__FramerMetadata__:{type:'variable'}}};"
            "export{getSnippets,snippetsSorting,__FramerMetadata__};\n"
        )

    if name.startswith("Sl9J9qvwjfXFK6CEoc7MIxKhLd9V1bj38qr253LNyOc."):
        # Keep the form's validation/terminal anatomy while making local success
        # truthful and preventing its automatic production-booking navigation.
        code = re.sub(
            r"setTimeout\(\(\)=>\{[$\w]+\.location\.href=([`\"'])"
            r"[^`\"']+\1\},1200\)",
            "void 0",
            code,
        )
        code = code.replace("message received \\u00b7 ticket ", "saved in this browser \\u00b7 local reference ")
        code = code.replace("message received · ticket ", "saved in this browser · local reference ")
        code = code.replace("Redirecting you to book a time", "local preview · no message was sent")
        code = code.replace("routing to ", "local draft for ")

    if name.startswith("HydraChat."):
        code = code.replace(
            "I'm connecting you with our team \\u2014 you can also reach us directly at ",
            "This is a local preview; no conversation was sent. Open ",
        ).replace(
            "I'm connecting you with our team — you can also reach us directly at ",
            "This is a local preview; no conversation was sent. Open ",
        )

    if "UnicornStudioEmbed" in code:
        # The runtime's source setter localizes the dynamically assembled SDK
        # URL. Its marker preserves the original reuse check across remounts.
        code = code.replace(
            'script[src^="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js"]',
            'script[data-hydra-unicorn-sdk]',
        )

    return code
