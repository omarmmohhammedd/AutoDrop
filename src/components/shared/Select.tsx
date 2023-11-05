import { Fragment, useCallback, useMemo, useState } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Icon } from '@iconify/react';

type Types = 'single' | 'multi';
interface IProps {
  type?: Types;
  placeholder?: string;
  options: any[];
  value: string | any[] | undefined;
  onSelect: (value: string | any[] | undefined) => void;
  searchPlaceholder?: string;
  onSearchChange?: (event: EventListener) => void;
  optionTxt: string;
  optionValue: string;
  hasSearch?: boolean;
}

export default function Select({
  type = 'single',
  placeholder = 'Select',
  options,
  value,
  onSearchChange,
  onSelect,
  searchPlaceholder,
  optionTxt,
  optionValue,
  hasSearch = true
}: IProps) {
  //   const [selected, setSelected] = useState<any[] | string | number | undefined>(value);
  const [search, setSearch] = useState<string | undefined>();

  const GetSelected = useMemo(() => {
    let result: any;
    if (type === 'single') {
      result = options?.find((option: any) => option?.[optionValue] === value)?.[optionTxt];
    } else {
      result = options?.filter((option: any) => (value as any[])?.includes(option?.[optionValue]));
    }
    return result;
  }, [options, value, type]);

  const handleClear = useCallback(
    function (val: any) {
      if (type === 'single') {
        onSelect(undefined);
      } else {
        // console.log(value);
        onSelect((value as any[])?.filter((ev) => ev !== val));
      }
    },
    [value, options]
  );

  const filterOptions = useMemo(() => {
    return options?.filter((option: any) =>
      search ? option?.[optionTxt]?.includes(search) : option
    );
  }, [options, search]);

  return (
    <div>
      <Listbox
        value={value}
        onChange={onSelect}
        multiple={type === 'multi'}
      >
        <div className="relative mt-1">
          <Listbox.Button className="form-select form-outline text-start">
            {type === 'multi' ? (
              <div>
                <div className="inline-flex gap-2">
                  {value
                    ? GetSelected?.map((option: any, index: string | number) => (
                        <button
                          className="inline-flex gap-1 items-center shrink-0 bg-gray-200 text-gray-500 text-xs rounded px-3 py-1.5 [padding-inline-end:0.4rem]"
                          key={index}
                          type="button"
                          onClick={() => handleClear(option?.[optionValue])}
                        >
                          <span>{option?.[optionTxt]}</span>
                          <span>
                            <Icon
                              icon="ri:close-fill"
                              width={16}
                            />
                          </span>
                        </button>
                      ))
                    : null}
                </div>
              </div>
            ) : (
              <span className="block text-start">{GetSelected ? GetSelected : placeholder}</span>
            )}
          </Listbox.Button>
          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm z-20">
              {hasSearch && (
                <div className="p-2 border-b border-b-gray-200">
                  <input
                    type="text"
                    name="search-dropdown"
                    id="search-dropdown"
                    placeholder={searchPlaceholder || 'Search'}
                    onChange={({ target }: { target: HTMLInputElement }) => setSearch(target.value)}
                    className="form-input form-outline !px-3 !py-2"
                  />
                </div>
              )}
              {filterOptions.map((option: any, idx: string | number) => (
                <Listbox.Option
                  key={idx}
                  className={({ active }) =>
                    `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                      active
                        ? 'bg-primary/5 text-primary hover:bg-primary/10'
                        : 'text-gray-600 hover:bg-transparent'
                    }`
                  }
                  value={option?.[optionValue]}
                >
                  {({ selected }) => (
                    <>
                      <span
                        className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}
                      >
                        {option?.[optionTxt]}
                      </span>
                      {selected ? (
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                          •
                        </span>
                      ) : null}
                    </>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}
