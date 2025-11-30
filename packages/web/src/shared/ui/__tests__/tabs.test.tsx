import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "../tabs";

describe("Tabs", () => {
  it("should render tabs with triggers and content", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Tab 1")).toBeInTheDocument();
    expect(screen.getByText("Tab 2")).toBeInTheDocument();
    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should show content for default tab", () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>
    );

    expect(screen.getByText("Content 1")).toBeInTheDocument();
  });

  it("should apply custom className to TabsList", () => {
    const { container } = render(
      <Tabs>
        <TabsList className="custom-list">
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const list = container.querySelector('[role="tablist"]');
    expect(list).toHaveClass("custom-list");
  });

  it("should apply custom className to TabsTrigger", () => {
    const { container } = render(
      <Tabs>
        <TabsList>
          <TabsTrigger value="tab1" className="custom-trigger">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    const trigger = container.querySelector('[role="tab"]');
    expect(trigger).toHaveClass("custom-trigger");
  });

  it("should apply custom className to TabsContent", () => {
    const { container } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1" className="custom-content">
          Content
        </TabsContent>
      </Tabs>
    );
    const content = container.querySelector('[role="tabpanel"]');
    expect(content).toHaveClass("custom-content");
  });

  it("should forward ref to TabsList", () => {
    const ref = { current: null };
    render(
      <Tabs>
        <TabsList ref={ref}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("should forward ref to TabsTrigger", () => {
    const ref = { current: null };
    render(
      <Tabs>
        <TabsList>
          <TabsTrigger ref={ref} value="tab1">
            Tab 1
          </TabsTrigger>
        </TabsList>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });

  it("should forward ref to TabsContent", () => {
    const ref = { current: null };
    render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent ref={ref} value="tab1">
          Content
        </TabsContent>
      </Tabs>
    );
    expect(ref.current).toBeInstanceOf(HTMLElement);
  });
});
