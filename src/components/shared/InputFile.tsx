import { Icon } from '@iconify/react';
import React from 'react';
import { motion } from 'framer-motion';
import { MoveToBottom, MoveToTop } from '../../animations';

interface IInputProps {
  title?: string;
  defaultValue?: FileList | File | null;
  onValueChange: (params: any) => void;
  multiple?: boolean;
  accept?: string;
}

interface ResultInterface {
  path: string;
  file: File;
}

const InputFile: React.FC<IInputProps> = ({
  title,
  defaultValue,
  multiple = false,
  onValueChange,
  accept
}) => {
  const ElementID = React.useId();
  const inputFileRef = React.useRef<HTMLInputElement>(null);

  const GenerateFileSize = (size: number) =>
    new Intl.NumberFormat('en-us', { notation: 'compact' }).format(size);

  const GenerateIconByType = (type: string) => {
    const types = {
      image: 'uim:image-v',
      pdf: 'fa6-solid:file-pdf',
      another: 'ph:file-text-duotone'
    };

    if (/image/.test(type)) {
      return types['image'];
    } else if (/pdf/.test(type)) {
      return types['pdf'];
    } else {
      return types['another'];
    }
  };

  const GenerateURI = React.useMemo(() => {
    let result: Array<ResultInterface> = [];
    if (!defaultValue) return result;
    const isArray = defaultValue instanceof FileList;

    if (isArray) {
      for (let index = 0; index < defaultValue?.length; index++) {
        const file = defaultValue[index];
        result.push({
          path: URL.createObjectURL(file as File),
          file: file as File
        });
      }
    } else {
      result.push({
        path: URL.createObjectURL(defaultValue as File),
        file: defaultValue
      });
    }

    return result;
  }, [defaultValue]);

  const RemoveAttachment = React.useCallback(
    function (item: ResultInterface) {
      const element = document.getElementById(ElementID) as HTMLInputElement | null;
      const isArray = defaultValue instanceof FileList;
      let dt = new DataTransfer();

      if (isArray) {
        for (let index = 0; index < defaultValue?.length; index++) {
          const file = defaultValue[index];
          if (file.name !== item.file.name) {
            dt.items.add(file);
          }
        }
        onValueChange(dt.files);
        if (element) element.files = dt.files;
      } else {
        onValueChange(undefined);
        if (element) element.value = '';
      }
    },
    [defaultValue]
  );

  return (
    <React.Fragment>
      <div className="form-group">
        <label
          htmlFor={ElementID}
          className="form-label"
        >
          {title}
        </label>
        <input
          type="file"
          name={ElementID}
          id={ElementID}
          className="form-file form-outline"
          onChange={({ target }: { target: HTMLInputElement }) => {
            onValueChange(multiple ? target?.files : target?.files?.[0]);
          }}
          multiple={multiple}
          ref={inputFileRef}
          accept={accept}
        />
      </div>
      {defaultValue ? (
        <div className="grid">
          <ul className="flex items-center gap-3 flex-wrap">
            {GenerateURI.map((item: ResultInterface, index: string | number) => (
              <li
                className="shrink-0"
                key={index}
              >
                <a
                  href={item.path}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex gap-3 bg-neutral-100 rounded-xl p-3"
                >
                  <span className="shrink-0 text-neutral-500 self-center">
                    <Icon
                      icon={GenerateIconByType(item.file.type)}
                      width={25}
                    />
                  </span>
                  <div className="flex-1 shrink-0">
                    <div className="grid">
                      <motion.p
                        animate="visible"
                        initial="hidden"
                        variants={MoveToTop}
                        className="text-sm font-semibold text-neutral-800 truncate"
                      >
                        {item.file.name}
                      </motion.p>
                    </div>
                    <motion.p
                      animate="visible"
                      initial="hidden"
                      variants={MoveToBottom}
                      className="text-xs font-medium text-neutral-500"
                    >
                      {GenerateFileSize(item.file.size)}
                    </motion.p>
                  </div>
                  <span className="shrink-0 self-center">
                    <button
                      className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center"
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        RemoveAttachment(item);
                      }}
                    >
                      <span className="shrink-0">
                        <Icon
                          icon="mdi:trash-can-empty"
                          width={18}
                        />
                      </span>
                    </button>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </React.Fragment>
  );
};

export default InputFile;
