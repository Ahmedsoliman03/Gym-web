import { JobFeed } from "@/features/jobs/components/job-feed";
import { JobHeader } from "@/features/jobs/components/job-header";
import { AddJobButton } from "@/features/jobs/components/add-job-button";

export default function JobsPage() {
  return (
    <div className="pt-24 pb-12 px-6 md:px-12">
      <JobHeader />

      <div className="max-w-4xl mx-auto">
        <AddJobButton />
        <JobFeed />
      </div>
    </div>
  );
}
