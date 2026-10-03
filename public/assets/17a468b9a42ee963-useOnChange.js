import { useEffect } from "react";
//@ts-ignore
import { isMotionValue } from "/assets/67a05c96a4fb2a62-isMotionValue.js";
export function useOnChange(value, callback) {
    useEffect(()=>// @ts-ignore this should be detected as a MV :shrug:
        isMotionValue(value) ? value.onChange(callback) : undefined
    );
}
export function useMultiOnChange(values, handler) {
    useEffect(()=>{
        const subscriptions = values.map((value)=>value.onChange(handler)
        );
        return ()=>subscriptions.forEach((unsubscribe)=>unsubscribe()
            )
        ;
    });
}

export const __FramerMetadata__ = {"exports":{"Subscriber":{"type":"tsType","annotations":{"framerContractVersion":"1"}},"useOnChange":{"type":"function","annotations":{"framerContractVersion":"1"}},"useMultiOnChange":{"type":"function","annotations":{"framerContractVersion":"1"}}}}
//# sourceMappingURL=./useOnChange.map