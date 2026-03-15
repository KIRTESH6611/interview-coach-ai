interface SkillTagProps {
  skill: string;
}

export default function SkillTag({ skill }: SkillTagProps) {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono text-brand bg-brand/10 border border-brand/20">
      {skill}
    </span>
  );
}
