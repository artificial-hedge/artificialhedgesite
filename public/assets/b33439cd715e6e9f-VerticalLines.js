import{jsx as _jsx}from"react/jsx-runtime";import{addPropertyControls,ControlType}from"framer";/**
 * Vertical Lines
 *
 * A lightweight component that renders vertical lines using CSS gradients.
 * Optimized for performance with infinite scalability.
 *
 * @framerSupportedLayoutWidth any-prefer-fixed
 * @framerSupportedLayoutHeight any-prefer-fixed
 */export default function VerticalLines(props){const{lineColor="#000000",backgroundColor="transparent",lineThickness=1,lineSpacing=20}=props;const patternSize=lineThickness+lineSpacing;return /*#__PURE__*/_jsx("div",{style:{...props.style,position:"relative",width:"100%",height:"100%",backgroundColor,backgroundImage:`repeating-linear-gradient(
                    90deg,
                    ${lineColor},
                    ${lineColor} ${lineThickness}px,
                    transparent ${lineThickness}px,
                    transparent ${patternSize}px
                )`,backgroundSize:`${patternSize}px 100%`,backgroundPosition:"center"}});}addPropertyControls(VerticalLines,{lineColor:{type:ControlType.Color,title:"Line Color",defaultValue:"#000000"},backgroundColor:{type:ControlType.Color,title:"Background",defaultValue:"transparent"},lineThickness:{type:ControlType.Number,title:"Thickness",defaultValue:1,min:1,max:50,step:1,unit:"px"},lineSpacing:{type:ControlType.Number,title:"Spacing",defaultValue:20,min:0,max:200,step:1,unit:"px"}});
export const __FramerMetadata__ = {"exports":{"default":{"type":"reactComponent","name":"VerticalLines","slots":[],"annotations":{"framerSupportedLayoutHeight":"any-prefer-fixed","framerSupportedLayoutWidth":"any-prefer-fixed","framerContractVersion":"1"}},"__FramerMetadata__":{"type":"variable"}}}
//# sourceMappingURL=./VerticalLines.map