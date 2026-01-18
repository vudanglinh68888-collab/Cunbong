
import React from 'react';
import { Skill } from '../types';
import { SKILL_COLORS } from '../constants';
import { ChevronRight } from 'lucide-react';

interface SkillCardProps {
  skill: Skill;
  score: number;
  onClick: () => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, score, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="glass-card p-5 rounded-2xl flex items-center justify-between group hover:shadow-xl transition-all duration-300 text-left"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white ${SKILL_COLORS[skill]}`}>
          <span className="font-bold text-lg">{skill[0]}</span>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">{skill}</h3>
          <p className="text-sm text-slate-500">Last Practice: Band {score.toFixed(1)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="text-2xl font-bold text-slate-800">{score.toFixed(1)}</div>
        <ChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  );
};

export default SkillCard;
