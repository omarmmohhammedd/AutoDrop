import Card from './Card';

export default function ProductCardPlaceholder() {
  return (
    <Card>
      <div className="flex flex-col gap-4">
        <div className="w-full h-40 bg-gray-100 animate-pulse"></div>
        <div className="w-2/3 h-4 rounded bg-gray-200 animate-pulse"></div>
        <div className="space-y-2">
          <div className="w-full h-3 rounded bg-gray-100 animate-pulse"></div>
          <div className="w-1/2 h-3 rounded bg-gray-100 animate-pulse"></div>
        </div>
      </div>
    </Card>
  );
}
