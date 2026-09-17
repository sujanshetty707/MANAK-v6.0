# Graph Report - MANAK  (2026-09-17)

## Corpus Check
- 105 files · ~94,603 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 621 nodes · 1122 edges · 54 communities (37 shown, 9 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `81af976d`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Officer Flow
- AppContext.tsx
- firebaseAuthService.ts
- package.json
- README.md
- What You Must Do When Invoked
- compilerOptions
- graphify reference: extra exports and benchmark
- Ponytail
- Ponytail
- Ponytail Help
- compilerOptions
- MANAK — Project Guidelines & Skills
- graphify reference: query, path, explain
- ponytail-audit/SKILL.md
- Ponytail Gain
- ponytail-review/SKILL.md
- graphify reference: add a URL and watch a folder
- graphify reference: commit hook and native AGENTS.md integration
- graphify reference: incremental update and cluster-only
- ponytail-debt/SKILL.md
- graphify reference: GitHub clone and cross-repo merge
- graphify reference: transcribe video and audio
- rules/graphify.md
- ponytail.md
- extraction-spec.md
- workflows/graphify.md
- manifest.json
- ExampleInstrumentedTest.java
- api.ts
- gradlew
- MainActivity.java
- dependencies
- MANAK — Technical Architecture, System Pipeline & Progress Overview
- MANAK — API Keys & Backend Environment Setup Guide
- labelParser.ts
- Product Requirements Document (PRD)
- scripts
- MANAK: AI-Powered Legal Metrology Compliance Checker
- devDependencies
- Addendum: Channel-Gate the Online-Required / Package-Only Split
- pdfReportGenerator.ts
- vite.config.ts
- capacitor.config.ts
- AppProvider
- @supabase/supabase-js

## God Nodes (most connected - your core abstractions)
1. `useApp()` - 50 edges
2. `react` - 29 edges
3. `lucide-react` - 27 edges
4. `parseLabelText()` - 25 edges
5. `AppProvider()` - 19 edges
6. `Header()` - 18 edges
7. `ExtractionResult` - 18 edges
8. `compilerOptions` - 16 edges
9. `getApiBaseUrl()` - 13 edges
10. `Product` - 13 edges

## Surprising Connections (you probably didn't know these)
- `GoogleVisionOcrResult` --references--> `ExtractionResult`  [EXTRACTED]
  server/services/googleVisionOcr.ts → src/types/index.ts
- `Officer Flow` ----> `E-Commerce DOM Adapters`  [EXTRACTED]
  manak-app-flow.md → MANAK-Technical-Architecture.md
- `Officer Flow` ----> `Report & Digital Signature`  [EXTRACTED]
  manak-app-flow.md → MANAK-Technical-Architecture.md
- `Officer Flow` ----> `IndexedDB Offline Sync`  [EXTRACTED]
  manak-app-flow.md → MANAK-Technical-Architecture.md
- `processGoogleVisionOcr()` --calls--> `parseLabelText()`  [EXTRACTED]
  server/services/googleVisionOcr.ts → src/services/labelParser.ts

## Import Cycles
- None detected.

## Communities (54 total, 9 thin omitted)

### Community 0 - "Officer Flow"
Cohesion: 0.24
Nodes (12): Consumer Flow, Deterministic Rule Engine, E-Commerce DOM Adapters, OCR & Extraction Pipeline, Inspection & Violation Repository, Packaged Commodities Rules 2011, MANAK Compliance System, Officer Flow (+4 more)

### Community 1 - "AppContext.tsx"
Cohesion: 0.11
Nodes (40): @capacitor/camera, @capacitor/core, lucide-react, react, App(), BottomNav(), DeviceFrame(), Header() (+32 more)

### Community 2 - "firebaseAuthService.ts"
Cohesion: 0.21
Nodes (15): ConsumerLoginScreen(), { apiKey, projectId }, firebaseApp, firebaseAuth, firebaseConfig, getStoredFirebaseConfig(), formatIndianPhoneNumber(), getFirebaseErrorMessage() (+7 more)

### Community 3 - "package.json"
Cohesion: 0.09
Nodes (21): name, private, type, version, autoprefixer, @capacitor/android, clsx, concurrently (+13 more)

### Community 4 - "README.md"
Cohesion: 0.05
Nodes (36): 1. `server/services/googleVisionOcr.ts`, 1. System Architecture Overview, 2. 4-Step Technical Workflow, 2. `src/services/labelParser.ts`, 3. Module Responsibilities, 3. `src/components/screens/ExtractedTextReviewScreen.tsx`, 4. `src/services/ruleEngine.ts`, 5. `src/services/pdfReportGenerator.ts` (+28 more)

### Community 5 - "What You Must Do When Invoked"
Cohesion: 0.08
Nodes (24): For /graphify add and --watch, For /graphify query, For the commit hook and native AGENTS.md integration, For --update and --cluster-only, /graphify, Honesty Rules, Interpreter guard for subcommands, Part A - Structural extraction for code files (+16 more)

### Community 6 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleResolution, noEmit (+10 more)

### Community 7 - "graphify reference: extra exports and benchmark"
Cohesion: 0.22
Nodes (8): graphify reference: extra exports and benchmark, Step 6b - Wiki (only if --wiki flag), Step 7 - Neo4j export (only if --neo4j or --neo4j-push flag), Step 7a - FalkorDB export (only if --falkordb or --falkordb-push flag), Step 7b - SVG export (only if --svg flag), Step 7c - GraphML export (only if --graphml flag), Step 7d - MCP server (only if --mcp flag), Step 8 - Token reduction benchmark (only if total_words > 5000)

### Community 8 - "Ponytail"
Cohesion: 0.22
Nodes (8): Boundaries, Intensity, Output, Persistence, Ponytail, Rules, The ladder, When NOT to be lazy

### Community 9 - "Ponytail"
Cohesion: 0.22
Nodes (8): Boundaries, Intensity, Output, Persistence, Ponytail, Rules, The ladder, When NOT to be lazy

### Community 10 - "Ponytail Help"
Cohesion: 0.25
Nodes (7): Configure Default Mode, Deactivate, Levels, More, Ponytail Help, Skills, Update

### Community 11 - "compilerOptions"
Cohesion: 0.25
Nodes (7): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, skipLibCheck, include

### Community 12 - "MANAK — Project Guidelines & Skills"
Cohesion: 0.33
Nodes (5): Graphify — Codebase Context & Knowledge Graph, Key Rules:, MANAK — Project Guidelines & Skills, Ponytail — Lazy Senior Dev Mode, Rules:

### Community 13 - "graphify reference: query, path, explain"
Cohesion: 0.33
Nodes (5): For /graphify explain, For /graphify path, graphify reference: query, path, explain, Step 0 — Constrained query expansion (REQUIRED before traversal), Step 1 — Traversal

### Community 14 - "ponytail-audit/SKILL.md"
Cohesion: 0.40
Nodes (4): Boundaries, Hunt, Output, Tags

### Community 15 - "Ponytail Gain"
Cohesion: 0.40
Nodes (4): Boundaries, Honesty boundary, Ponytail Gain, Scoreboard

### Community 16 - "ponytail-review/SKILL.md"
Cohesion: 0.40
Nodes (4): Boundaries, Examples, Format, Scoring

### Community 17 - "graphify reference: add a URL and watch a folder"
Cohesion: 0.50
Nodes (3): For /graphify add, For --watch, graphify reference: add a URL and watch a folder

### Community 18 - "graphify reference: commit hook and native AGENTS.md integration"
Cohesion: 0.50
Nodes (3): For git commit hook, For native AGENTS.md integration, graphify reference: commit hook and native AGENTS.md integration

### Community 19 - "graphify reference: incremental update and cluster-only"
Cohesion: 0.50
Nodes (3): For --cluster-only, For --update (incremental re-extraction), graphify reference: incremental update and cluster-only

### Community 20 - "ponytail-debt/SKILL.md"
Cohesion: 0.50
Nodes (3): Boundaries, Output, Scan

### Community 29 - "manifest.json"
Cohesion: 0.18
Nodes (10): background_color, categories, description, display, icons, name, orientation, short_name (+2 more)

### Community 30 - "ExampleInstrumentedTest.java"
Cohesion: 0.33
Nodes (5): ExampleInstrumentedTest, ExampleUnitTest, androidx.test.ext.junit.runners.AndroidJUnit4, org.junit.runner.RunWith, org.junit.Test

### Community 31 - "api.ts"
Cohesion: 0.07
Nodes (57): Props, ServerSettingsModal(), ConsumerStatementText(), AppContextType, MOCK_CONSUMER_REPORTS, MOCK_HISTORY, REPEAT_VIOLATOR_HEATMAP, SAMPLE_PRODUCTS (+49 more)

### Community 32 - "gradlew"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 33 - "MainActivity.java"
Cohesion: 0.47
Nodes (4): MainActivity, android.os.Bundle, com.getcapacitor.BridgeActivity, Override

### Community 40 - "dependencies"
Cohesion: 0.09
Nodes (23): dependencies, @capacitor/android, @capacitor/camera, @capacitor/cli, @capacitor/core, @capacitor/filesystem, @capacitor/share, clsx (+15 more)

### Community 41 - "MANAK — Technical Architecture, System Pipeline & Progress Overview"
Cohesion: 0.07
Nodes (27): 1. Executive Summary & What MANAK Is, 1. Rule 7 Numeral Height Measurement Constraints, 2. Cylindrical, Curved & Metallic Surface OCR, 2. System Architecture & Components, 3. E-Commerce DOM Selector Drift, 3. Technology Stack & Tools, 4. End-to-End System Pipeline, 4. Offline Client OCR Performance & Accuracy (+19 more)

### Community 42 - "MANAK — API Keys & Backend Environment Setup Guide"
Cohesion: 0.22
Nodes (8): 1. Summary of Required Credentials, 2. Step-by-Step Instructions to Obtain Each Key, 3. Database & Storage Initialization Checklist, 4. Verification, A. Supabase Credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`), B. Google Gemini API Key (`GEMINI_API_KEY`), C. Digital Signature Token (`DOCUMENSO_API_KEY`), MANAK — API Keys & Backend Environment Setup Guide

### Community 43 - "labelParser.ts"
Cohesion: 0.08
Nodes (40): cors, dotenv, express, tesseract.js, ensureUUID(), app, db, otpRegistry (+32 more)

### Community 44 - "Product Requirements Document (PRD)"
Cohesion: 0.18
Nodes (10): 1. Problem Statement, 2. Updated 4-Phase System Pipeline, 3. Core Functional Requirements, 4. Non-Functional Requirements, MANAK — Legal Metrology Compliance Checker App, Phase 1: Product Capture & Scan, Phase 2: Google Vision OCR & Product Categorization, Phase 3: Human Review & Verification Interface (`ExtractedTextReviewScreen`) (+2 more)

### Community 45 - "scripts"
Cohesion: 0.18
Nodes (11): scripts, adb:reverse, build, cap:add, cap:live, cap:open, cap:sync, dev (+3 more)

### Community 46 - "MANAK: AI-Powered Legal Metrology Compliance Checker"
Cohesion: 0.08
Nodes (23): 1. 📱 Frontend (User Experience), 2. 👁️ The "Eyes": Multimodal AI (Google Gemini), 3. ⚖️ The "Brain": Deterministic Legal Rule Engine, 4. ⚡ Offline-First Architecture, 5. 📑 Instant Legal Documentation (PDF Generator), A Single Mobile App with Two Smart Personas:, *Automated Legal Metrology Compliance at Your Fingertips*, MANAK: AI-Powered Legal Metrology Compliance Checker (+15 more)

### Community 47 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, autoprefixer, concurrently, postcss, tailwindcss, tsx, @types/react, @types/react-dom (+3 more)

### Community 48 - "Addendum: Channel-Gate the Online-Required / Package-Only Split"
Cohesion: 0.29
Nodes (6): 1. Add a `channel` parameter and thread it through, 2. Where `channel` gets set (MANAK backend entry points), 3. `analyze_seller_upload` note, 4. Test to add, 5. Non-goal, Addendum: Channel-Gate the Online-Required / Package-Only Split

### Community 49 - "pdfReportGenerator.ts"
Cohesion: 0.38
Nodes (9): @capacitor/filesystem, @capacitor/share, jspdf, generateInspectionPDF(), getManakLogoDataUrl(), getMrpStr(), getNetQtyStr(), safeNum() (+1 more)

### Community 52 - "AppProvider"
Cohesion: 0.29
Nodes (13): AppProvider(), signOutFirebaseConsumer(), subscribeToFirebaseAuth(), addToOfflineQueue(), clearOfflineQueue(), getOfflineQueue(), getStoredConsumerReports(), getStoredInspections() (+5 more)

## Knowledge Gaps
- **289 isolated node(s):** `config`, `name`, `private`, `version`, `type` (+284 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 327 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `AppContext.tsx` to `firebaseAuthService.ts`, `package.json`, `api.ts`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `dependencies` connect `dependencies` to `package.json`?**
  _High betweenness centrality (0.034) - this node is a cross-community bridge._
- **Why does `lucide-react` connect `AppContext.tsx` to `firebaseAuthService.ts`, `package.json`, `api.ts`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `config`, `name`, `private` to the rest of the system?**
  _289 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `AppContext.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.11466325660699062 - nodes in this community are weakly interconnected._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.09090909090909091 - nodes in this community are weakly interconnected._
- **Should `README.md` be split into smaller, more focused modules?**
  _Cohesion score 0.05263157894736842 - nodes in this community are weakly interconnected._