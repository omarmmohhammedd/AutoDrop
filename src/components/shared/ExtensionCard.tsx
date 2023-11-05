import moment from 'moment';
import { useSelector } from 'react-redux';
import { RootState } from 'src/store';
import Card from './Card';
import Image from './Image';
import Instructions from './Instructions';

export default function ExtensionCard({ extension }: { extension: any }) {
  const { user } = useSelector((state: RootState) => state.auth);
  return (
    <Card>
      <div className="flex items-start gap-4">
        <Image
          alt="Extension logo"
          src={extension.logo}
          className="w-14 h-14 rounded-full object-cover shrink-0"
        />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between gap-3">
            <p className="font-semibold">{extension.name}</p>
            <Instructions
              Label={() => <></>}
              Body={() => <>{extension.details}</>}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm text-gray-500">#{extension.appId}</p>
            <p className="text-sm text-gray-500 line-clamp-2">{extension.details}</p>
          </div>
          <p className="text-xs text-gray-500">{moment(extension.createdAt).fromNow()}</p>
          {user?.store?.extension === extension.id && (
            <p className="w-full p-2 bg-red-500 text-white text-xs font-medium text-center rounded">
              INSTALLED
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
