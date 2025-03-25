import { jsx } from 'react/jsx-runtime';
import { forwardRef } from 'react';
import { Flex } from '../Flex/index.js';

const VStack=forwardRef(function VStack(props,ref){return jsx(Flex,{ref:ref,direction:"column",...props})});

export { VStack };
mn",...props})});

exports.VStack = VStack;
