import { Box } from '@chakra-ui/core';
import dynamic from 'next/dynamic';
import { GoSearch } from 'react-icons/go';
import { createFilter } from 'react-select';
import { FixedSizeList } from 'react-window';
import colors from 'styles/colors';

const DynamicReactSelect = dynamic(() => import('react-select'), { ssr: false });

export default function CustomSelect({ options, placeholder, value, onChange, ...props }) {
    return (
        <DynamicReactSelect
            classNamePrefix='react-select'
            onChange={onChange}
            options={options}
            placeholder={placeholder}
            instanceId='1'
            filterOption={createFilter({ ignoreAccents: false })}
            value={value}
            components={{ MenuList, DropdownIndicator }}
            styles={{
                container: (provided) => ({
                    ...provided,
                    width: '100%',
                    maxWidth: 500,
                }),
                control: (provided) => ({
                    ...provided,
                    width: '100%',
                    minHeight: 48,
                    borderRadius: '30px',
                    padding: '0 20px 0 10px',
                }),
                menu: (provided) => ({
                    ...provided,
                    borderRadius: '10px',
                    padding: '4px 0',
                }),
                indicatorSeparator: () => ({ display: 'none' }),
                input: (provided) => ({
                    ...provided,
                    color: colors.black,
                }),
                placeholder: (provided) => ({
                    ...provided,
                    color: colors.black,
                }),
            }}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary25: colors.red_lighter,
                    primary: colors.red_strong,
                },
            })}
            {...props}
        />
    );
}

function MenuList({ options, children, maxHeight, getValue }) {
    const height = 40;
    const [value] = getValue();
    const initialOffset = options.indexOf(value) * height;

    return (
        <FixedSizeList
            height={maxHeight}
            itemCount={children.length}
            itemSize={height}
            initialScrollOffset={initialOffset}>
            {({ index, style }) => <div style={style}>{children[index]}</div>}
        </FixedSizeList>
    );
}

function DropdownIndicator() {
    return <Box as={GoSearch} size='20px' color='gray.600' />;
}
