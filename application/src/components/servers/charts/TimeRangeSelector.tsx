
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimeRange = '60m' | '1d' | '7d' | '1m' | '3m';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

const timeRangeOptions = [
  { value: '60m' as TimeRange, label: 'Last 60 minutes' },
  { value: '1d' as TimeRange, label: 'Last 24 hours' },
  { value: '7d' as TimeRange, label: 'Last 7 days' },
  { value: '1m' as TimeRange, label: 'Last 30 days' },
  { value: '3m' as TimeRange, label: 'Last 90 days' },
];

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <Select value={value} onValueChange={(value: TimeRange) => onChange(value)}>
      <SelectTrigger className="w-[160px] h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {timeRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};