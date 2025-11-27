import { useCallback, useEffect, useState } from "react";

import { devtools, runtime } from "@/shared/chrome-api";
import { Button, Card } from "@/shared/ui";
import { ElementSelectedMessage, sendTabMessage } from "@/shared/utils/messaging";

type Step = "title" | "company" | "description" | "complete";

interface ExtractedData {
  titleSelector?: string;
  companySelector?: string;
  descriptionSelector?: string;
  urlPattern?: string;
}

export function LearningMode() {
  const [step, setStep] = useState<Step>("title");
  const [data, setData] = useState<ExtractedData>({});
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(false);

  // Get the inspected tab ID from DevTools API
  const tabId = devtools.getInspectedTabId();

  const restartPicking = useCallback(async () => {
    // Small delay to ensure previous click doesn't trigger anything immediately
    setTimeout(async () => {
      await sendTabMessage(tabId, { action: "startLearning" });
    }, 100);
  }, [tabId]);

  const handleElementSelected = useCallback(
    (selector: string, _text: string) => {
      if (!isActive) return;
      if (step === "title") {
        setData((prev) => ({ ...prev, titleSelector: selector }));
        setStep("company");
        restartPicking();
      } else if (step === "company") {
        setData((prev) => ({ ...prev, companySelector: selector }));
        setStep("description");
        restartPicking();
      } else if (step === "description") {
        setData((prev) => ({ ...prev, descriptionSelector: selector }));
        setStep("complete");
      }
    },
    [isActive, step, restartPicking]
  );

  useEffect(() => {
    // Get URL from inspected window
    devtools.getInspectedUrl().then((url) => {
      setCurrentUrl(url);
    });

    // Listen for element selection
    const listener = (message: ElementSelectedMessage) => {
      if (message.action === "elementSelected") {
        handleElementSelected(message.selector, message.text);
      }
    };
    const removeListener = runtime.onMessage(listener);

    return () => {
      removeListener();
      // Cleanup: stop learning mode
      if (isActive) {
        sendTabMessage(tabId, { action: "stopLearning" });
      }
    };
  }, [tabId, isActive, handleElementSelected]);

  const handleDownload = () => {
    const hostname = new URL(currentUrl).hostname;
    const config = {
      name: hostname,
      urlPattern: hostname,
      selectors: {
        title: data.titleSelector,
        company: data.companySelector,
        description: data.descriptionSelector,
      },
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${hostname.replace(/\./g, "-")}-config.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStart = async () => {
    setIsActive(true);
    setStep("title");
    setData({});
    await sendTabMessage(tabId, { action: "startLearning" });
  };

  const handleStop = async () => {
    setIsActive(false);
    await sendTabMessage(tabId, { action: "stopLearning" });
  };

  const handleReset = async () => {
    setStep("title");
    setData({});
    await sendTabMessage(tabId, { action: "startLearning" });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Learning Mode</h2>
        <div className="flex gap-2">
          {!isActive ? (
            <Button onClick={handleStart}>Start Learning Mode</Button>
          ) : (
            <>
              {step === "complete" && (
                <Button variant="secondary" onClick={handleReset}>
                  Start Over
                </Button>
              )}
              <Button variant="secondary" onClick={handleStop}>
                Stop
              </Button>
            </>
          )}
        </div>
      </div>

      <Card className="p-6">
        {!isActive ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Click "Start Learning Mode" to begin selecting elements on the page.</p>
            <p className="text-sm text-gray-500">
              This will enable element picking mode where you can hover and click to select job title, company, and
              description elements.
            </p>
          </div>
        ) : (
          <>
            {step === "title" && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Step 1: Select Job Title</h3>
                <p className="text-sm text-gray-600">
                  Hover over the job title element on the page and click to select it.
                </p>
              </div>
            )}
            {step === "company" && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Step 2: Select Company Name</h3>
                <p className="text-sm text-gray-600">
                  Hover over the company name element on the page and click to select it.
                </p>
                <div className="mt-3 text-xs text-gray-500">
                  ✓ Title selector: <code className="bg-gray-100 px-1 rounded">{data.titleSelector}</code>
                </div>
              </div>
            )}
            {step === "description" && (
              <div>
                <h3 className="font-semibold mb-2 text-lg">Step 3: Select Job Description</h3>
                <p className="text-sm text-gray-600">
                  Hover over the container of the job description and click to select it.
                </p>
                <div className="mt-3 space-y-1 text-xs text-gray-500">
                  <div>
                    ✓ Title selector: <code className="bg-gray-100 px-1 rounded">{data.titleSelector}</code>
                  </div>
                  <div>
                    ✓ Company selector: <code className="bg-gray-100 px-1 rounded">{data.companySelector}</code>
                  </div>
                </div>
              </div>
            )}
            {step === "complete" && (
              <div className="space-y-4">
                <h3 className="font-semibold text-green-600 text-lg">✓ Configuration Ready!</h3>
                <div className="text-xs font-mono bg-gray-100 p-3 rounded overflow-x-auto max-h-64 overflow-y-auto">
                  <pre>{JSON.stringify(data, null, 2)}</pre>
                </div>
                <Button onClick={handleDownload} className="w-full">
                  Download Config JSON
                </Button>
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded">
                  <strong>Next steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>
                      Save the downloaded file to{" "}
                      <code className="bg-white px-1 rounded">
                        src/features/extract-job/lib/extractors/dynamic/configs/
                      </code>
                    </li>
                    <li>
                      Import it in <code className="bg-white px-1 rounded">configs/index.ts</code>
                    </li>
                    <li>Reload the extension</li>
                  </ol>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {isActive && step !== "complete" && (
        <div className="text-sm text-gray-500 text-center bg-yellow-50 p-3 rounded">
          💡 <strong>Tip:</strong> Hover to highlight elements, click to select
        </div>
      )}
    </div>
  );
}
