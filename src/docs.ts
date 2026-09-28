import readme from "../README.md";
import prd from "../docs/PRD.md";
import fiveWhys from "../docs/FIVE_WHYS.md";
import evidence from "../docs/EVIDENCE_AND_ASSUMPTIONS.md";
import taxonomy from "../docs/EVENT_TAXONOMY.md";
import experiment from "../docs/EXPERIMENT_DESIGN.md";
import validation from "../docs/VALIDATION_48_72H.md";
import backlog from "../docs/EXPERIMENT_BACKLOG.md";
import storyboard from "../docs/ANIMATION_STORYBOARD.md";
import walkthrough from "../docs/WALKTHROUGH.md";
import design from "../docs/DESIGN_AND_BRAND.md";

export interface Doc {
  slug: string;
  title: string;
  markdown: string;
}

export const DOCS: Doc[] = [
  { slug: "readme", title: "README", markdown: readme },
  { slug: "prd", title: "PRD", markdown: prd },
  { slug: "five-whys", title: "5 Whys: evidence vs assumptions", markdown: fiveWhys },
  { slug: "evidence-and-assumptions", title: "Evidence and assumptions register", markdown: evidence },
  { slug: "event-taxonomy", title: "Event taxonomy", markdown: taxonomy },
  { slug: "experiment-design", title: "Experiment design", markdown: experiment },
  { slug: "experiment-backlog", title: "Experiment backlog", markdown: backlog },
  { slug: "validation-48-72h", title: "48–72h validation plan", markdown: validation },
  { slug: "animation-storyboard", title: "Before/after: rationale and storyboard", markdown: storyboard },
  { slug: "walkthrough", title: "Walkthrough and demo script", markdown: walkthrough },
  { slug: "design-and-brand", title: "Design and brand notes", markdown: design },
];
