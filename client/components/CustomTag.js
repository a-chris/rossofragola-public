import { Tag, TagCloseButton, TagLabel } from '@chakra-ui/core';
import styled from 'styled-components';

function CustomTag({ children, onClose, ...props }) {
    return (
        <Tag
            size='xl'
            rounded='full'
            variant='solid'
            variantColor='red'
            color='white'
            p='5px 15px 6px'
            m='5px'
            {...props}>
            <TagLabel p='2px'>{children}</TagLabel>
            <TagCloseButton mt='3px' ml='5px' onClick={onClose} />
        </Tag>
    );
}

const StyledTag = styled(CustomTag)`
    & button > svg {
        width: 24px;
        height: 24px;
    }
`;

export default StyledTag;
