import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const resumeSchema = {
    type: "object",
    properties: {
        name: {
            type: "string",
            description: "Candidate's full name"
        },
        email: {
            type: "string",
            description: "Candidate's email address"
        },
        phone: {
            type: "string",
            description: "Candidate's phone number"
        },
        skills: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Technical and professional skills found in the resume"
        },
        education: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Education qualifications found in the resume"
        },
        experience: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Work experience found in the resume"
        },
        projects: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Projects found in the resume"
        },
        missingSections: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Important resume sections that are missing"
        },
        score: {
            type: "integer",
            description: "Resume completeness score from 0 to 100"
        },
        status: {
            type: "string",
            enum: ["VERIFIED", "REJECTED"]
        },
        suggestions: {
            type: "array",
            items: {
                type: "string"
            },
            description: "Suggestions for improving the resume"
        }
    },
    required: [
        "name",
        "email",
        "phone",
        "skills",
        "education",
        "experience",
        "projects",
        "missingSections",
        "score",
        "status",
        "suggestions"
    ]
};


export const analyzeResume = async (resumeText) => {

    try {

        if (!resumeText || resumeText.trim().length === 0) {
            throw new Error("Resume text is empty.");
        }

        const prompt = `
You are a resume analysis assistant.

Analyze the following resume text.

Your tasks:

1. Extract the candidate's name.
2. Extract email.
3. Extract phone number.
4. Extract technical and professional skills.
5. Extract education information.
6. Extract work experience.
7. Extract projects.
8. Identify important missing sections.
9. Give a completeness score from 0 to 100.
10. Give VERIFIED if the resume contains the important basic information.
11. Give REJECTED if important information is missing.
12. Provide useful suggestions for improving the resume.

Important:
- Do not invent information.
- If information is not available, return an empty string or empty array.
- This is a resume content/completeness analysis.
- Do not claim that education, employment, or other credentials are authentic.
- Return only data matching the requested JSON structure.

Resume Text:

${resumeText}
`;

        const response = await ai.models.generateContent({
            model: "gemini-3.7-flash",

            contents: prompt,

            config: {
                responseMimeType: "application/json",
                responseSchema: resumeSchema
            }
        });

        const result = JSON.parse(response.text);

        return result;

    } catch (error) {

        console.error("Gemini Resume Analysis Error:", error);

        throw new Error("Failed to analyze resume using Gemini.");
    }
};