import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { NutritionDashboard } from "@/features/nutrition/components/nutrition-dashboard";

const styles = {
  container: "pt-20 sm:pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto",
};

export default function NutritionPage() {
  const t = useTranslations("Nutrition");

  return (
    <div className={styles.container}>
      <PageHeader 
        title={t("title")} 
        highlight={t("highlight")} 
        description={t("desc")} 
      />
      <NutritionDashboard />
    </div>
  );
}
