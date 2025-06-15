// Initial tools configuration for MCP server
export const initialTools = [
  {
    name: "ask_user",
    description: "Prompts the user with a question via a pop-up command prompt and awaits their interactive response.",
    inputSchema: {
      type: "object",
      properties: {
        projectName: {
          type: "string",
          description: "Identifies the context/project making the request"
        },
        message: {
          type: "string",
          description: "The specific question for the user. Supports Markdown formatting."
        },
        predefinedOptions: {
          type: "array",
          items: {
            type: "string"
          },
          description: "Predefined options for the user to choose from (optional)"
        }
      },
      required: ["projectName", "message"]
    }
  }
];