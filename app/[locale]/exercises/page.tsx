import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/page-header";
import { ExerciseExplorer } from "@/features/exercises/components/exercise-explorer";

const styles = {
  container: "pt-20 sm:pt-24 pb-20 px-4 sm:px-6 md:px-12 max-w-6xl mx-auto",
};

export default function ExercisesPage() {
  const t = useTranslations("Exercises");

  return (
    <div className={styles.container}>
      <PageHeader title={t("title")} highlight={t("highlight")} description={t("description")} />
      <ExerciseExplorer />
    </div>
  );
}
