import { ChangeEvent } from 'react';
import EmptyCard from 'src/components/shared/EmptyCard';
import ExtensionCard from 'src/components/shared/ExtensionCard';
import ExtensionPlaceholder from 'src/components/shared/ExtensionPlaceholder';
import Pagination from 'src/components/shared/Pagination';
import SearchBox from 'src/components/shared/SearchBox';
import useExtensionHooks from 'src/hooks/extensions';

export default function index() {
  let rerender: boolean = true;
  const { pagination, isLoading, extensions, getExtensions } = useExtensionHooks();
  return (
    <div className="p-6 pt-2 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex-1">
          <div className="w-full !max-w-screen-sm">
            <SearchBox
              onChange={(ev: ChangeEvent<HTMLInputElement>) =>
                getExtensions({ search_key: ev.target?.value })
              }
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <>
            {Array.from({ length: 6 }).map((_, index) => (
              <ExtensionPlaceholder key={index} />
            ))}
          </>
        ) : (
          <>
            {extensions.map((extension) => (
              <ExtensionCard
                extension={extension}
                key={extension.id}
              />
            ))}

            {!extensions.length && (
              <div className="col-span-full">
                <EmptyCard
                  icon="fluent-mdl2:product-variant"
                  title="Empty result"
                  content="It seems that there are no extensions linked to your store yet. You can add a new product by clicking on the Add button. You can add the appropriate product for your store activity."
                />
              </div>
            )}
          </>
        )}
      </div>
      <Pagination
        pagination={pagination}
        onNextClick={() => {
          getExtensions({ page: pagination.current_page + 1 });
        }}
        onPreviousClick={() => {
          getExtensions({ page: pagination.current_page - 1 });
        }}
      />
    </div>
  );
}
