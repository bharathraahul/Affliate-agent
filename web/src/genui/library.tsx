import { z } from "zod/v4";
import { createLibrary, defineComponent } from "@openuidev/react-lang";

/**
 * The set of components Odette is allowed to emit as OpenUI Lang.
 * Keep it small and demo-focused: a vertical Stack of concierge prose (Text)
 * and recommended ProductCards that carry affiliate buy links.
 */

export const Text = defineComponent({
  name: "Text",
  description: "A line of assistant prose in Odette's warm concierge voice.",
  props: z.object({ value: z.string() }),
  component: ({ props }) => <p className="genui-text">{props.value}</p>,
});

export const ProductCard = defineComponent({
  name: "ProductCard",
  description:
    "A single recommended product with an affiliate buy link. " +
    "Positional args, in order: title, price, imageUrl, rationale, buyUrl. " +
    "rationale is Odette's one-line reason the pick suits the shopper.",
  props: z.object({
    title: z.string(),
    price: z.string(),
    imageUrl: z.string(),
    rationale: z.string(),
    buyUrl: z.string(),
  }),
  component: ({ props }) => (
    <div className="pcard">
      <img className="pcard__img" src={props.imageUrl} alt={props.title} />
      <div className="pcard__body">
        <span className="pcard__title">{props.title}</span>
        <span className="pcard__price">{props.price}</span>
        <span className="pcard__why">{props.rationale}</span>
        <a
          className="pcard__buy"
          href={props.buyUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Shop now
        </a>
      </div>
    </div>
  ),
});

const Stack = defineComponent({
  name: "Stack",
  description:
    "Root vertical container for a chat response. Children stack top to bottom.",
  props: z.object({
    children: z.array(z.union([Text.ref, ProductCard.ref])),
  }),
  component: ({ props, renderNode }) => (
    <div className="genui-stack">{renderNode(props.children)}</div>
  ),
});

export const odetteLibrary = createLibrary({
  root: "Stack",
  components: [Stack, Text, ProductCard],
});
