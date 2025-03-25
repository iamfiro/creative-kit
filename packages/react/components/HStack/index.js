'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');
var index = require('../Flex/index.js');

const HStack=react.forwardRef(function HStack(props,ref){return jsxRuntime.jsx(index.Flex,{ref:ref,direction:"row",...props})});

exports.HStack = HStack;
