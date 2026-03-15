interface WaveformBarsProps {
  active: boolean;
}

const BAR_HEIGHTS = [8, 12, 16, 20, 16, 12, 8];
const BAR_DELAYS = ['0s', '0.1s', '0.2s', '0.3s', '0.2s', '0.1s', '0s'];

export default function WaveformBars({ active }: WaveformBarsProps) {
  if (!active) return null;
  return (
    <div className="flex items-end gap-0.5">
      {BAR_HEIGHTS.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-rose animate-wave"
          style={{ height: `${h}px`, animationDelay: BAR_DELAYS[i] }}
        />
      ))}
    </div>
  );
}
