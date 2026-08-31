import { Character } from '../../types/dbd';
import { getInitials } from '../../utils/characters';
import { describeArc, polarToCartesian } from './geometry';

type WheelSliceProps = {
  character: Character;
  index: number;
  total: number;
};

export function WheelSlice({ character, index, total }: WheelSliceProps) {
  const sliceAngle = 360 / total;
  const startAngle = index * sliceAngle - 90;
  const endAngle = startAngle + sliceAngle;
  const midAngle = startAngle + sliceAngle / 2;
  const path = describeArc(0, 0, 310, startAngle, endAngle);
  const portraitPoint = polarToCartesian(0, 0, 252, midAngle);
  const textPoint = polarToCartesian(0, 0, 152, midAngle);
  const portraitClipId = `portrait-clip-${character.type}-${index}`;

  return (
    <g>
      <defs>
        <clipPath id={portraitClipId}>
          <circle r="21" />
        </clipPath>
      </defs>

      <path d={path} fill={character.color} stroke="#0f172a" strokeWidth="2" />
      <g transform={`translate(${portraitPoint.x} ${portraitPoint.y})`}>
        <circle r="25" fill="#f8fafc" />
        {character.portrait ? (
          <image
            href={character.portrait}
            x="-21"
            y="-21"
            width="42"
            height="42"
            preserveAspectRatio="xMidYMid slice"
            clipPath={`url(#${portraitClipId})`}
          />
        ) : (
          <>
            <circle r="21" fill={character.color} />
            <text className="portrait-text" textAnchor="middle" dy="7">
              {getInitials(character.name)}
            </text>
          </>
        )}
      </g>
      <text
        className="slice-name"
        x={textPoint.x}
        y={textPoint.y}
        textAnchor="middle"
        dominantBaseline="middle"
        transform={`rotate(${midAngle} ${textPoint.x} ${textPoint.y})`}
      >
        {character.name.length > 22 ? `${character.name.slice(0, 20)}...` : character.name}
      </text>
    </g>
  );
}
