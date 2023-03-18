import { useEffect, useRef, useState } from 'react';
import type { InputRef, MenuProps } from 'antd';
import { Dropdown, Input } from 'antd';
import { DownOutlined, SearchOutlined, CloseOutlined } from '@ant-design/icons';
import { useMemoizedFn } from 'ahooks';

type FilterOptions = {
    filterDropdown: JSX.Element;
    filterDropdownOpen: boolean;
    filterIcon: JSX.Element;
};
type FilterType = 'input' | 'select';
type BaseConfig = {
    click: any;
};
type InputConfig = BaseConfig & {
    placeholder?: string;
    type?: 'string' | 'number';
};
type SelectConfig = BaseConfig & {
    items: MenuProps['items'];
    className?: string;
};
type ConfigType<T> = T extends 'input' ? InputConfig : SelectConfig;
type FilterOptionsFunc = <T extends FilterType>(
    filterType: FilterType,
    config: ConfigType<T>,
) => FilterOptions;

enum FilterTypeEnum {
    input = 'input',
    select = 'select',
}

const useTableFilter = <T extends string | number | undefined>(
    initValue: T,
) => {
    const [value, setValue] = useState<T>(initValue);
    const [visible, toggleVisible] = useState<boolean>(false);
    const inputRef = useRef<InputRef>(null);

    useEffect(() => {
        if (visible && inputRef.current) {
            setTimeout(() => {
                inputRef.current!.focus({
                    cursor: 'end',
                });
            }, 10);
        }
    }, [visible]);

    const handleressEnterEvents = useMemoizedFn(
        <T extends FilterType>(value: any, config: ConfigType<T>) => {
            setValue(value);
            (config as SelectConfig).click();
            toggleVisible(false);
        },
    );

    const curFilterDropdown = useMemoizedFn(
        <T extends FilterType>(filterType: FilterType, config: ConfigType<T>) => {
            if (filterType === FilterTypeEnum.input) {
                return (
                    <Input
                        className="rounded-md"
                        ref={inputRef}
                        allowClear={{
                            clearIcon: <CloseOutlined />
                        }}
                        onBlur={() => {
                            toggleVisible(false);
                        }}
                        value={value}
                        onPressEnter={(e: any) =>
                            handleressEnterEvents<T>(e.target.value, config)
                        }
                        onChange={(e: any) => {
                            // number 仅是返回数字字符串
                            if (
                                (config as InputConfig)?.type === 'number' &&
                                e.target.value &&
                                isNaN(Number(e.target.value))
                            )
                                return;

                            setValue(e.target.value);
                        }}
                        placeholder={(config as InputConfig).placeholder}
                    />
                );
            } else {
                return <></>;
            }
        },
    );

    const curFilterIcon = useMemoizedFn(
        <T extends FilterType>(filterType: FilterType, config: ConfigType<T>) => {
            if (filterType === FilterTypeEnum.input) {
                return (
                    <SearchOutlined
                        style={{ color: '#B7D7FF' }}
                        className="h-4 w-4"
                        onClick={() => {
                            toggleVisible(true);
                        }}
                    />
                );
            } else {
                const preItems = (config as SelectConfig).items;
                const items = preItems?.map((item: any) => {
                    return {
                        ...item,
                        label: (
                            <div
                                onClick={() => {
                                    setValue(item.key);
                                    (config as SelectConfig).click();
                                    toggleVisible(!visible);
                                }}
                            >
                                {item.label}
                            </div>
                        ),
                    };
                });

                return (
                    <Dropdown
                        menu={{ items } as any}
                        overlayClassName={(config as SelectConfig).className}
                    >
                        <DownOutlined style={{ color: '#B7D7FF' }} className="h-4 w-4" />
                    </Dropdown>
                );
            }
        },
    );

    const filterOptions: FilterOptionsFunc = useMemoizedFn(
        <T extends FilterType>(filterType: T, config: ConfigType<T>) => {
            const filterDropdown = (
                <div>{curFilterDropdown<T>(filterType, config)}</div>
            );
            const filterDropdownOpen = visible;
            const filterIcon = <div>{curFilterIcon(filterType, config)}</div>;

            return {
                filterDropdown,
                filterDropdownOpen,
                filterIcon,
            };
        },
    );

    return [value, filterOptions] as [T, FilterOptionsFunc];
};

export default useTableFilter;
