const { GoogleGenAI } = require('@google/genai');

/**
 * Initializes and returns a GoogleGenAI client instance.
 * The API key stays on the backend and is never sent to the frontend.
 */
const getGenAIClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (
    !apiKey ||
    apiKey.trim() === '' ||
    apiKey === 'your_gemini_api_key_here'
  ) {
    throw new Error(
      'GEMINI_API_KEY is not configured or is using a placeholder value in .env'
    );
  }

  return new GoogleGenAI({ apiKey });
};

/**
 * Wait helper used for temporary Gemini service errors.
 */
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Returns true when the error is temporary and worth retrying.
 */
const isRetryableError = (error) => {
  const message = String(error?.message || '').toLowerCase();

  return (
    message.includes('503') ||
    message.includes('unavailable') ||
    message.includes('service unavailable') ||
    message.includes('429') ||
    message.includes('resource exhausted') ||
    message.includes('too many requests') ||
    message.includes('500')
  );
};

/**
 * Generates a structured AI blueprint.
 *
 * The request is made ONLY from the backend.
 * React never communicates directly with Gemini.
 */
const generateBlueprint = async (projectData) => {
  const ai = getGenAIClient();

  const {
    title,
    description = '',
    architectureType = 'Full-stack MERN',
    techStack = [],
    prompt = '',
  } = projectData;

  const stackStr =
    Array.isArray(techStack) && techStack.length > 0
      ? techStack.join(', ')
      : 'Not specified';

  const systemInstruction = `
You are a Principal Software Architect and Systems Design Engineer.

Generate a practical, detailed technical blueprint for the software project.

Return ONLY valid JSON.
Do not use markdown code fences.
Do not add explanations outside the JSON.
`;

  const userPrompt = `
Generate a complete technical blueprint for this project.

PROJECT DETAILS:
- Title: ${title}
- Description: ${description || 'No description provided'}
- Target Architecture: ${architectureType}
- Technology Stack: ${stackStr}
- Specific Requirements: ${
    prompt || 'Use standard best practices for the selected architecture.'
  }

Return EXACTLY these five sections:

"systemArchitecture": {
  "summary": "Detailed architectural overview",
  "pattern": "Primary architecture pattern",

  "components": [
    {
      "name": "Component name",
      "role": "Responsibility of the component",
      "technologies": ["technology1", "technology2"]
    }
  ],

  "connections": [
    {
      "from": "Source component name",
      "to": "Target component name",
      "label": "Communication type",
      "description": "What data or communication passes between these components"
    }
  ],

  "dataFlow": "Step-by-step explanation of how requests and data move through the system",

  "diagram": "Mermaid diagram code",

  "fileStructure": {
    "name": "Project root folder name",
    "type": "folder",
    "children": [
      {
        "name": "client",
        "type": "folder",
        "children": [
          {
            "name": "src",
            "type": "folder",
            "children": [
              {
                "name": "pages",
                "type": "folder",
                "children": [
                  {
                    "name": "ActualPageFile.jsx",
                    "type": "file"
                  }
                ]
              },
              {
                "name": "components",
                "type": "folder",
                "children": [
                  {
                    "name": "ActualComponentFile.jsx",
                    "type": "file"
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        "name": "server",
        "type": "folder",
        "children": [
          {
            "name": "routes",
            "type": "folder",
            "children": []
          },
          {
            "name": "controllers",
            "type": "folder",
            "children": []
          },
          {
            "name": "models",
            "type": "folder",
            "children": []
          },
          {
            "name": "services",
            "type": "folder",
            "children": []
          }
        ]
      }
    ]
  },

  "keyConsiderations": [
    "Security",
    "Scalability",
    "Performance",
    "Reliability"
  ]
},

  "modules": [
    {
      "name": "Module name",
      "description": "Purpose of the module",
      "responsibilities": [
        "Responsibility 1",
        "Responsibility 2"
      ],
      "features": [
        "Feature 1",
        "Feature 2"
      ],
      "dependencies": [
        "Related module or service"
      ]
    }
  ],

  "databaseDesign": {
    "type": "Database technology/model",
    "summary": "Database strategy",
    "collections": [
      {
        "name": "Collection or table name",
        "description": "Purpose",
        "fields": [
          {
            "name": "field_name",
            "type": "Data type",
            "description": "Purpose of field",
            "required": true
          }
        ],
        "relationships": [
          "Relationship description"
        ]
      }
    ]
  },

  "apiDesign": [
    {
      "method": "GET",
      "endpoint": "/api/example",
      "description": "Purpose of endpoint",
      "authRequired": true,
      "requestBody": "Request details",
      "responseStatus": 200,
      "responseBody": "Response details"
    }
  ],

  "roadmap": [
    {
      "phase": "Phase 1: Foundation",
      "estimatedDuration": "1-2 weeks",
      "goals": [
        "Goal 1",
        "Goal 2"
      ],
      "tasks": [
        "Task 1",
        "Task 2"
      ]
    }
  ]
}

Make the blueprint specific to the user's project.
Use realistic technologies and architecture.
Keep the output useful for actual development.

The fileStructure is mandatory.
Do not omit fileStructure.
Do not return an empty fileStructure.
Generate realistic frontend and backend folders and actual filenames based on the project requirements.

FILE STRUCTURE REQUIREMENTS:
- Generate the fileStructure specifically for the user's project.
- Do not use placeholder filenames such as ActualPageFile.jsx or ActualComponentFile.jsx.
- Use realistic filenames based on the project's actual requirements, modules, architecture and technology stack.
- Include both frontend and backend folders.
- Include relevant folders such as pages, components, services, routes, controllers, models and other folders only when appropriate.
- Include actual file names inside the relevant folders.
- Include database-related collection/entity names where appropriate, but do not pretend database collections are source-code files.
- Do not invent unrelated files.
- The fileStructure must represent a practical development structure for this specific project.
- The fileStructure must be returned as valid JSON.`;

  /*
   * We use more than one current Gemini model.
   *
   * Primary model:
   * Gemini 3.8 Flash
   *
   * Fallback models:
   * Gemini 3.7 Flash
   * Gemini 3.5 Flash-Lite
   *
   * If one model is temporarily overloaded, the backend
   * can try another available model.
   */
  const models = [
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.5-flash-lite',
  ];

  let lastError = null;

  for (const model of models) {
    /*
     * Try each model up to 3 times for temporary errors.
     */
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(
          `Generating blueprint using ${model} (attempt ${attempt}/3)...`
        );

        const response = await ai.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemInstruction}\n\n${userPrompt}`,
                },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const rawText = response.text || '';

        if (!rawText.trim()) {
          throw new Error('Gemini API returned an empty response.');
        }

        let cleaned = rawText.trim();

        // Remove markdown JSON fences if Gemini adds them.
        if (cleaned.startsWith('```json')) {
          cleaned = cleaned
            .replace(/^```json\s*/i, '')
            .replace(/```\s*$/, '')
            .trim();
        } else if (cleaned.startsWith('```')) {
          cleaned = cleaned
            .replace(/^```\s*/, '')
            .replace(/```\s*$/, '')
            .trim();
        }

        let parsed;

        try {
          parsed = JSON.parse(cleaned);
        } catch (parseError) {
          console.error(
            `Invalid JSON returned by ${model}:`,
            parseError.message
          );

          throw new Error(
            'AI returned an invalid blueprint format. Please try generating again.'
          );
        }

        /*
         * Validate the five required sections.
         */
        const blueprint = {
          systemArchitecture:
            parsed.systemArchitecture ||
            parsed.system_architecture ||
            {},

          modules: Array.isArray(parsed.modules)
            ? parsed.modules
            : [],

          databaseDesign:
            parsed.databaseDesign ||
            parsed.database_design ||
            {},

          apiDesign: Array.isArray(
            parsed.apiDesign || parsed.api_design
          )
            ? parsed.apiDesign || parsed.api_design
            : [],

          roadmap: Array.isArray(parsed.roadmap)
            ? parsed.roadmap
            : [],
        };

        /*
        * Make sure we actually received useful blueprint content.
        */
        if (
          !blueprint.systemArchitecture ||
          Object.keys(blueprint.systemArchitecture).length === 0
        ) {
          throw new Error(
            'AI returned an incomplete system architecture.'
          );
        }

        // Ensure Gemini actually returned a useful file structure.
        if (
          !blueprint.systemArchitecture.fileStructure ||
          typeof blueprint.systemArchitecture.fileStructure !== 'object' ||
          !Array.isArray(blueprint.systemArchitecture.fileStructure.children) ||
          blueprint.systemArchitecture.fileStructure.children.length === 0
        ) {
          throw new Error(
            'AI response did not include a valid fileStructure'
          );
        }

        console.log(`Blueprint successfully generated using ${model}.`);

        return blueprint;
      } catch (error) {
        lastError = error;

        console.error(
          `${model} attempt ${attempt} failed:`,
          error.message
        );

        /*
         * If this isn't a temporary service problem,
         * don't waste time retrying it.
         */
        if (!isRetryableError(error)) {
          throw new Error(`AI Blueprint generation failed: ${error.message}`);
        }

        /*
         * Exponential backoff:
         * attempt 1 → 2 seconds
         * attempt 2 → 4 seconds
         */
        if (attempt < 3) {
          const delay = 2000 * Math.pow(2, attempt - 1);

          console.log(
            `Temporary Gemini error. Retrying ${model} in ${
              delay / 1000
            } seconds...`
          );

          await wait(delay);
        }
      }
    }

    console.log(
      `${model} is currently unavailable. Trying the next Gemini model...`
    );
  }

  throw new Error(
    `AI Blueprint generation is temporarily unavailable. ${
      lastError?.message || 'Please try again later.'
    }`
  );
};

module.exports = {
  generateBlueprint,
};