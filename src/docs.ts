import readme from "../README.md";
import prd from "../docs/PRD.md";
import fiveWhys from "../docs/FIVE_WHYS.md";
import taxonomy from "../docs/EVENT_TAXONOMY.md";
import experiment from "../docs/EXPERIMENT_DESIGN.md";
import validation from "../docs/VALIDATION_48_72H.md";
import demo from "../docs/DEMO_SCRIPT.md";

export interface Doc {
  slug: string;
  title: string;
  markdown: string;
}

export const DOCS: Doc[] = [
  { slug: "readme", title: "README", markdown: readme },
  { slug: "prd", title: "PRD", markdown: prd },
  { slug: "five-whys", title: "5 Whys: evidence vs assumptions", markdown: fiveWhys },
  { slug: "event-taxonomy", title: "Event taxonomy", markdown: taxonomy },
  { slug: "experiment-design", title: "Experiment design", markdown: experiment },
  { slug: "validation-48-72h", title: "48–72h validation plan", markdown: validation },
  { slug: "demo-script", title: "5-minute demo script", markdown: demo },
];
