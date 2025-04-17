# Deepread Evaluation System

## Overview

The evaluation system in Deepread assesses user responses to practice questions using a sophisticated 7-factor scoring system. The system is designed to provide targeted feedback based on the cognitive depth level of the question.

## Evaluation Factors

The system evaluates responses across seven dimensions:

1. **Accuracy**: Is the response factually correct?
2. **Clarity**: Is it clearly worded and easy to follow?
3. **Understanding**: Does it reflect a grasp of the core concept?
4. **Relevance**: Does the response stay focused on the prompt and concept?
5. **Depth**: Is the answer nuanced, insightful, or thoughtful?
6. **Contextual Fit**: Does the example or framing make sense in context?
7. **Creativity**: Does the response include original thinking or synthesis?

## Depth-Based Evaluation

For each depth level, only 4-5 of the 7 factors are used, with specific weight distributions:

### Depth 1: Recall
- **Accuracy** (40%)
- **Understanding** (30%)
- **Clarity** (20%)
- **Relevance** (10%)

### Depth 2: Reframe
- **Understanding** (30%)
- **Clarity** (30%)
- **Accuracy** (20%)
- **Relevance** (20%)

### Depth 3: Apply
- **Contextual Fit** (35%)
- **Relevance** (20%)
- **Understanding** (20%)
- **Clarity** (15%)
- **Depth** (10%)

### Depth 4: Contrast
- **Understanding** (25%)
- **Depth** (25%)
- **Relevance** (20%)
- **Clarity** (15%)
- **Accuracy** (15%)

### Depth 5: Critique
- **Depth** (30%)
- **Understanding** (25%)
- **Clarity** (20%)
- **Contextual Fit** (15%)
- **Relevance** (10%)

### Depth 6: Remix
- **Creativity** (30%)
- **Depth** (25%)
- **Understanding** (20%)
- **Contextual Fit** (15%)
- **Clarity** (10%)

## Scoring Process

1. Each active factor is scored on a scale of 0-10
2. Scores are multiplied by their respective weights
3. The weighted scores are summed and normalized to produce:
   - An `eval_score` from 0 to 1
   - A `simplified_score` from 0 to 5

## Progression Rules

Users must achieve a minimum score of 3 out of 5 on all questions at the current depth level to advance to the next level. If any answer scores below 3, the user must revise their answers before progressing.

## Technical Implementation

The evaluation system is implemented through:

1. A Supabase Edge Function (`evaluate_insight`) that:
   - Takes the user response, original insight, and depth target
   - Calls OpenAI's API with a depth-specific system prompt
   - Returns structured JSON with scores and explanation

2. A Frontend component that:
   - Collects user answers
   - Sends them for evaluation
   - Displays detailed feedback with color-coded scores
   - Controls progression to the next depth level

## Response Format

The evaluation system returns:

```json
{
  "factors": {
    "accuracy": 8,
    "understanding": 7,
    "clarity": 9,
    "relevance": 8
  },
  "eval_score": 0.78,
  "simplified_score": 3.9,
  "explanation": "Strong grasp of facts with clear expression. Could improve on demonstrating deeper understanding of underlying principles."
}
```

The explanation is always under 280 characters and focuses on specific strengths and areas for improvement. 