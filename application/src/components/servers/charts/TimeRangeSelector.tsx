
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { timeRangeOptions } from "./dataUtils";

type TimeRange = '60m' | '1d' | '7d' | '1m' | '3m';

interface TimeRangeSelectorProps {
  value: TimeRange;
  onChange: (value: TimeRange) => void;
}

export const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => {
  return (
    <Select value={value} onValueChange={(value: TimeRange) => onChange(value)}>
      <SelectTrigger className="w-[140px] h-8">
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