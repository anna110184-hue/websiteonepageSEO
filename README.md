# Website Onepage SEO Application

## Quick Start

1. **Read CLAUDE.md first** - Contains essential rules for Claude Code
2. Follow the pre-task compliance checklist before starting any work
3. Use proper module structure under `src/main/js/`
4. Commit after every completed task

## Project Overview

On-Page SEO Analyzer powered by Gemini AI with web scraping, analytics extraction, and AI-powered suggestions. This tool provides users with structured on-page SEO analytics and AI-powered improvement suggestions for any given website URL.

## Core Functionality

1. **Input**: A single input field for a user to paste a website URL
2. **Web Scraping**: The backend uses 'axios' to fetch the page's HTML and 'cheerio' to parse it
3. **Structured Analytics**: Extract key metrics including:
   - Word Count
   - Title Tag content and length
   - Meta Description content and length
   - Count of images missing 'alt' attributes
4. **AI-Powered SEO Suggestions**: Data sent to Google Gemini 1.5 Pro API to generate:
   - Overall SEO Score out of 100 with brief explanation
   - Prioritized checklist of 3-5 specific, actionable suggestions
   - Two new, creative blog post ideas based on the page's topic

## Technology Stack

- **Backend**: Node.js with Express (server.js)
- **Frontend**: Public directory containing index.html, style.css, and script.js
- **Dependencies**: express, axios, cheerio, dotenv, @google/generative-ai

## UI/UX Guidelines

- **Theme**: Professional, dark-mode design
- **Background**: #A1A1A1
- **Text**: White text
- **Primary accent**: Vibrant blue (#4097FF) for buttons
- **Layout**: Clean header with tool's name, loading indicator, results in two sections

## Standard Project Structure

**Standard Projects:** Full application structure with modular organization  

## Development Guidelines

- **Always search first** before creating new files
- **Extend existing** functionality rather than duplicating  
- **Use Task agents** for operations >30 seconds
- **Single source of truth** for all functionality
- **Language-agnostic structure** - works with Python, JS, Java, etc.
- **Scalable** - start simple, grow as needed
- **Flexible** - choose complexity level based on project needs