'use strict';

var react = require('react');
var index = require('../../_virtual/index.js');
var style_module = require('./style.module.scss.js');

const Flex=react.forwardRef(function Flex(props,ref){const{as,children,className,direction,justify,align,wrap,gap,style,fullHeight,fullWidth,fitContent,...rest}=props;return react.createElement(as||"div",{...rest,ref,className:index.default(style_module.default.flexLayout,{[style_module.default.row]:direction==="row",[style_module.default.column]:direction==="column",[style_module.default.justifyStart]:justify==="start",[style_module.default.justifyEnd]:justify==="end",[style_module.default.justifyCenter]:justify==="center",[style_module.default.justifyBetween]:justify==="between",[style_module.default.justifyAround]:justify==="around",[style_module.default.alignStart]:align==="start",[style_module.default.alignEnd]:align==="end",[style_module.default.alignCenter]:align==="center",[style_module.default.alignStretch]:align==="stretch",[style_module.default.wrap]:wrap==="wrap",[style_module.default.fullHeight]:fullHeight,[style_module.default.fullWidth]:fullWidth},className),style:{...style,gap:gap?`${gap}px`:undefined}},children)});

exports.Flex = Flex;
