#!/usr/bin/env node

import fs from "node:fs"
import path from "node:path"
import { spawnSync } from "node:child_process"

const style = process.argv[2]

if (!style) {
  console.error("Usage: npm run shadcn:style -- <style-name>")
  process.exit(1)
}

const rootDir = process.cwd()
const componentsConfigPath = path.join(rootDir, "components.json")
const uiDir = path.join(rootDir, "src", "components", "ui")

if (!fs.existsSync(componentsConfigPath)) {
  console.error("components.json not found.")
  process.exit(1)
}

if (!fs.existsSync(uiDir)) {
  console.error("src/components/ui not found.")
  process.exit(1)
}

const config = JSON.parse(fs.readFileSync(componentsConfigPath, "utf8"))
config.style = style
fs.writeFileSync(componentsConfigPath, `${JSON.stringify(config, null, 2)}\n`)
console.log(`Updated components.json style -> ${style}`)

const components = fs
  .readdirSync(uiDir)
  .filter((file) => file.endsWith(".tsx"))
  .map((file) => file.replace(/\.tsx$/, ""))
  .sort()

if (components.length === 0) {
  console.log("No UI components found to regenerate.")
  process.exit(0)
}

console.log(`Regenerating ${components.length} components with style '${style}'...`)

const failed = []
for (const componentName of components) {
  const command = `npx shadcn@latest add ${componentName} --yes --overwrite`
  const result = spawnSync(command, {
    cwd: rootDir,
    stdio: "inherit",
    shell: true,
    env: process.env,
  })

  if (result.status !== 0) {
    failed.push(componentName)
  }
}

if (failed.length > 0) {
  console.error(`Style switch completed with failures: ${failed.join(", ")}`)
  process.exit(1)
}

console.log("Style switch completed successfully.")

