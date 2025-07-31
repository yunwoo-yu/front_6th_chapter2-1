import { isTuesday } from '@/utils/dateUtils';

interface TuesdaySpecialBannerProps {
  isVisible: boolean;
}

/**
 * 화요일 특가 배너 컴포넌트
 * 베이직과 동일한 스타일로 화요일 특가 정보 표시
 */
const TuesdaySpecialBanner = ({ isVisible }: TuesdaySpecialBannerProps) => {
  const showBanner = isTuesday() && isVisible;

  if (!showBanner) {
    return null;
  }

  return (
    <div id="tuesday-special" className="bg-red-500 text-white px-4 py-2 text-center text-sm font-medium">
      <span className="text-xs uppercase tracking-wide">Tuesday Special 10% Applied</span>
    </div>
  );
};

export default TuesdaySpecialBanner;
