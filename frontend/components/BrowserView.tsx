const BrowserView = ({ screenshot }: { screenshot?: string }) => {
  if (!screenshot) {
    return (
      <div className="text-zinc-500 text-md">
        No browser snapshot yet.
      </div>
    );
  }

  return (
    <img
      src={screenshot}
      alt="Browser snapshot"
      className="w-full rounded-md border border-zinc-800"
    />
  );
};

export default BrowserView;
