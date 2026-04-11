"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { Camera, X, Plus, ChevronRight } from "lucide-react";

const styles = {
  section: "space-y-8 pt-8 border-t border-white/5",
  sectionTitle: "text-sm font-black text-primary uppercase mb-6",
  
  transGrid: "flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 no-scrollbar snap-x scroll-smooth",
  transCard: "min-w-[280px] md:min-w-[320px] bg-white/5 rounded-2xl border border-white/5 p-4 space-y-4 snap-start relative group",
  transImage: "w-full aspect-[4/3] rounded-xl bg-black/20 overflow-hidden relative border border-white/5 flex items-center justify-center group/img",
  transImageOverlay: "absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-[2px]",
  transDelete: "absolute top-6 right-6 p-2 bg-red-500/10 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white z-10 shadow-xl",
  addTransBtn: "min-w-[280px] md:min-w-[320px] aspect-[4/3] md:aspect-auto md:h-full flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/5 rounded-2xl text-foreground/20 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all group active:scale-95 py-2",
  
  inputWrapper: "flex flex-col gap-2",
  label: "text-xs font-black text-foreground/40 uppercase ml-1",
  input: "bg-white/5 py-2.5 border border-white/5 rounded-xl px-4 text-foreground focus:outline-none focus:border-primary/50 transition-colors text-base",
};

import { CustomSelect } from "@/components/ui/custom-select";

export interface TransformationItem {
  id: string;
  name: string;
  durationValue: string;
  durationUnit: string;
  image: string;
}

interface TransformationEditorProps {
  transformations: TransformationItem[];
  onChange: (transformations: TransformationItem[]) => void;
}

export const TransformationEditor = ({
  transformations,
  onChange,
}: TransformationEditorProps) => {
  const t = useTranslations("Profile");
  const sliderRef = useRef<HTMLDivElement>(null);

  const durationUnitOptions = [
    { label: t('weeks'), value: 'weeks' },
    { label: t('months'), value: 'months' },
    { label: t('years'), value: 'years' },
  ];

  const scroll = (direction: "left" | "right") => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleAdd = () => {
    const newItem: TransformationItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      durationValue: "",
      durationUnit: "weeks",
      image: ""
    };
    onChange([...transformations, newItem]);
  };

  const handleRemove = (id: string) => {
    onChange(transformations.filter(item => item.id !== id));
  };

  const handleUpdate = (id: string, field: keyof TransformationItem, value: string) => {
    onChange(transformations.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleBlur = (id: string) => {
    onChange(transformations.map(item => {
      if (item.id === id) {
        let newVal = item.durationValue;
        let newUnit = item.durationUnit;

        if (newVal === '4' && newUnit === 'weeks') {
          newVal = '1';
          newUnit = 'months';
        } else if (newVal === '12' && newUnit === 'months') {
          newVal = '1';
          newUnit = 'years';
        }

        return { 
          ...item, 
          durationValue: newVal,
          durationUnit: newUnit 
        };
      }
      return item;
    }));
  };

  const handleImageChange = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(id, 'image', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={styles.section}>
      <div className="flex items-center justify-between">
        <h2 className={styles.sectionTitle}>{t('transformationGallery')}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-white/5 rounded-full text-foreground/40 hover:text-foreground transition-colors border border-white/5"
          >
            <ChevronRight size={16} className="rotate-180" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-white/5 rounded-full text-foreground/40 hover:text-foreground transition-colors border border-white/5"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div ref={sliderRef} className={styles.transGrid}>
        {transformations.map((item) => (
          <div key={item.id} className={styles.transCard}>
            <button
              onClick={() => handleRemove(item.id)}
              className={styles.transDelete}
            >
              <X size={16} />
            </button>

            <div className={styles.transImage}>
              {item.image ? (
                <img src={item.image} alt="Transformation" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-foreground/20">
                  <Camera size={24} />
                  <span className="text-[10px] font-black uppercase">{t('noImage')}</span>
                </div>
              )}
              <label className={styles.transImageOverlay}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageChange(item.id, e)}
                />
                <Camera className="text-white" size={24} />
              </label>
            </div>

            <div className="space-y-4">
              <div className={styles.inputWrapper}>
                <label className={styles.label}>{t('fullName')}</label>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins"
                  value={item.name}
                  onChange={(e) => handleUpdate(item.id, 'name', e.target.value)}
                  className={styles.input}
                />
              </div>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>{t('transformationDuration')}</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="0"
                    value={item.durationValue}
                    onChange={(e) => handleUpdate(item.id, 'durationValue', e.target.value)}
                    onBlur={() => handleBlur(item.id)}
                    className={`${styles.input} w-24`}
                  />
                  <CustomSelect
                    value={item.durationUnit}
                    onChange={(val) => {
                      handleUpdate(item.id, 'durationUnit', val);
                      // Trigger blur logic immediately after unit change if we want
                      // but user said "click out of input"
                    }}
                    onBlur={() => handleBlur(item.id)}
                    options={durationUnitOptions}
                    placeholder={t('months')}
                    className="flex-1"
                    openUpwards
                  />
                </div>
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={handleAdd}
          className={styles.addTransBtn}
        >
          <div className="p-4 bg-primary/10 rounded-full group-hover:bg-primary/20 transition-colors">
            <Plus className="text-primary" size={24} />
          </div>
          <span className="text-xs font-black uppercase tracking-wider">{t('addNew')}</span>
        </button>
      </div>

      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
