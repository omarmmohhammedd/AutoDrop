import Card from './Card';

export default function ExtensionPlaceholder() {
  return (
    <Card>
      <div className="flex gap-4">
        <div className="h-14 w-14 rounded-full bg-gray-100 animate-pulse"></div>
        <div className="space-y-2 flex-1">
          <div className="w-2/3 h-4 rounded bg-gray-200 animate-pulse"></div>
          <div className="w-full h-3 rounded bg-gray-100 animate-pulse"></div>
          <div className="w-1/2 h-3 rounded bg-gray-100 animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
}
