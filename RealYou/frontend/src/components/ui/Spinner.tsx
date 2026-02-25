export default function Spinner({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      {message && <p className="text-lg text-gray-600">{message}</p>}
    </div>
  );
}
