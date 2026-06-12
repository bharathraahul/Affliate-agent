// This is a template for an agent that is written as a TypeScript program. The
// agent can make use of an LLM, but it's main logic and flow is specified in
// code.

// A basic framework for a new coded agent. This directive tells the agent
// compiler to compile your agent into a state machine that can be stopped and
// resumed. You should always include this for a coded agent.
"use agent";

// TODO: Import the set of tools that you need for your agent. By
// default, your agent only has access to UI tools that let it interact
// with the chat console and console tools for logging.
import {
  type Task,
  consoleTools,
  guildTools,
  agent,
  pick,
  userInterfaceTools,
} from "@guildai/agents-sdk";
import { z } from "zod";

const description = `
TODO: write an agent description to explain what this agent does and how it
should be used.

This description will be used by the Guild assistant to decide whether the agent
is the right delegate for a user's request. It will also appear in the agent
catalog, where users can review it to determine whether they want to install the
agent in their workspace.

Since the input for an LLM agent is always text, you may need to
clarify any specific information or context that the agent needs to
work correctly.

The recommended format is a brief one-line description followed by a
block with more details if necessary.
`;

// TODO: describe the format of the input that your agent expects using a Zod
// schema: see <https://zod.dev/> for details.
//
// Tips:
// - The input must always be a `z.object` (otherwise it will likely cause
//   errors when invoked as a tool by an LLM).
// - If your agent takes no arguments, then just leave this as an empty object.
// - Provide `.describe` arguments to help an LLM use your agent effectively.
const inputSchema = z.object({
  shape: z
    .enum(["circle", "square", "triangle"])
    .describe("The shape to draw."),
  color: z
    .enum(["red", "blue", "green"])
    .describe("The color of the shape to draw."),
  content: z.string().describe("The text to render inside the shape"),
});

type Input = z.infer<typeof inputSchema>;

// TODO: describe the format of the output that your agent generates.
const outputSchema = z.object({
  format: z.enum(["svg", "pdf"]).describe("The rendering format chosen"),
  content: z
    .string()
    .describe("The object rendered using the specified format"),
});

type Output = z.infer<typeof outputSchema>;

// TODO: enumerate the tools that your agent needs to accomplish its task. These
// will be available using the tool's name on the `task.tools` object.
const tools = {
  // For services with extremely large tool sets, use `pick` to choose a subset.
  ...pick(guildTools, ["guild_get_me"]),

  // ...for smaller services, you can include all the tools using
  // syntax like the following:
  ...userInterfaceTools,

  // Required for task.console.log/debug/warn/error.
  ...consoleTools,
};

type Tools = typeof tools;

// TODO: implement the agent's code. Your agent will only be invoked with input
// that exactly matches its input schema, and it must return a result that
// matches its output schema. You can also throw an exception if there is an
// error.
async function run(
  { shape, color, content }: Input,
  task: Task<Tools>,
): Promise<Output> {
  // Use `task.console` to write debugging messages visible in test mode. Be
  // sure to `await` this.
  await task.console.log(
    `Rendering a ${color} ${shape} containing the words ${content}`,
  );

  switch (shape) {
    case "circle":
    case "square":
    case "triangle":
      // exercise left to you, gentle reader!
      break;
  }

  // If for some reason we needed it...
  const { id, name } = await task.tools.guild_get_me({});
  await task.console.log(`The current user is ${name} (id=${id})`);

  return { format: "svg", content: "<svg>...</svg>" };
}

export default agent({
  description,
  inputSchema,
  outputSchema,
  tools,
  run,
});