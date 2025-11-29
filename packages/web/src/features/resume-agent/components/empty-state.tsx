import { IconBriefcase, IconFileText, IconRocket } from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui";

import { GetStartListItem } from "./get-start-list-item";

interface EmptyStateProps {
  hasResume: boolean;
  hasJobDescription: boolean;
}

export function EmptyState({ hasResume, hasJobDescription }: EmptyStateProps) {
  return (
    <div className="m-auto w-full flex items-center justify-center px-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Get Started</CardTitle>
          <CardDescription className="text-center">
            Add your resume and job description to begin processing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <GetStartListItem
              icon={IconFileText}
              title="Add Resume"
              completedTitle="Resume Added"
              description="Click 'Add Resume' in the toolbar to paste your current resume."
              completedDescription="Your resume has been added. You can edit it from the toolbar."
              isCompleted={hasResume}
            />
            <GetStartListItem
              icon={IconBriefcase}
              title="Add Job Description"
              completedTitle="Job Description Added"
              description="Click 'Add Job Description' in the toolbar to paste the job posting."
              completedDescription="Job description has been added. You can edit it from the toolbar."
              isCompleted={hasJobDescription}
            />
            <GetStartListItem
              icon={IconRocket}
              title="Process Your Resume"
              completedTitle="Ready to Process"
              description={
                <>
                  Once you&apos;ve added both your resume and job description, click the{" "}
                  <span className="font-semibold text-foreground">Start 🚀</span> button in the toolbar to process your
                  resume.
                </>
              }
              completedDescription={
                <>
                  Click the <span className="font-semibold text-foreground">Start 🚀</span> button in the toolbar to
                  process your resume and generate the adapted version.
                </>
              }
              isCompleted={hasResume && hasJobDescription}
              isPrimary={true}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
