<template>
  <div class="tiptap-editor">
    <!-- Toolbar -->
    <div v-if="editor" class="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-2 flex flex-wrap gap-1">
      <!-- Text Style -->
      <div class="flex items-center gap-1 pr-3 border-r border-gray-200">
        <button
          type="button"
          @click="editor.chain().focus().toggleBold().run()"
          :class="['toolbar-btn', { active: editor.isActive('bold') }]"
          title="Bold (Ctrl+B)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleItalic().run()"
          :class="['toolbar-btn', { active: editor.isActive('italic') }]"
          title="Italic (Ctrl+I)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 4h4m-2 0v16m-4 0h8" transform="skewX(-10)" />
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleUnderline().run()"
          :class="['toolbar-btn', { active: editor.isActive('underline') }]"
          title="Underline (Ctrl+U)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 4v7a5 5 0 0010 0V4M5 20h14" />
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleStrike().run()"
          :class="['toolbar-btn', { active: editor.isActive('strike') }]"
          title="Strikethrough"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 10.5c.5.5.5 1 .5 1.5a4 4 0 01-4 4H9a4 4 0 01-4-4c0-1.5 1-3 2.5-3.5M5 12h14M9.5 6.5A4 4 0 0114 4h1a4 4 0 014 4" />
          </svg>
        </button>
      </div>

      <!-- Headings -->
      <div class="flex items-center gap-1 pr-3 border-r border-gray-200">
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          :class="['toolbar-btn', { active: editor.isActive('heading', { level: 2 }) }]"
          title="Heading 2"
        >
          <span class="text-sm font-bold">H2</span>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          :class="['toolbar-btn', { active: editor.isActive('heading', { level: 3 }) }]"
          title="Heading 3"
        >
          <span class="text-sm font-bold">H3</span>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().setParagraph().run()"
          :class="['toolbar-btn', { active: editor.isActive('paragraph') }]"
          title="Paragraph"
        >
          <span class="text-sm">¶</span>
        </button>
      </div>

      <!-- Lists -->
      <div class="flex items-center gap-1 pr-3 border-r border-gray-200">
        <button
          type="button"
          @click="editor.chain().focus().toggleBulletList().run()"
          :class="['toolbar-btn', { active: editor.isActive('bulletList') }]"
          title="Bullet List"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <circle cx="2" cy="6" r="1" fill="currentColor" />
            <circle cx="2" cy="12" r="1" fill="currentColor" />
            <circle cx="2" cy="18" r="1" fill="currentColor" />
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleOrderedList().run()"
          :class="['toolbar-btn', { active: editor.isActive('orderedList') }]"
          title="Numbered List"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 6h13M7 12h13M7 18h13" />
            <text x="2" y="8" font-size="8" fill="currentColor">1</text>
            <text x="2" y="14" font-size="8" fill="currentColor">2</text>
            <text x="2" y="20" font-size="8" fill="currentColor">3</text>
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().toggleBlockquote().run()"
          :class="['toolbar-btn', { active: editor.isActive('blockquote') }]"
          title="Quote"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      <!-- Links & Media -->
      <div class="flex items-center gap-1 pr-3 border-r border-gray-200">
        <button
          type="button"
          @click="setLink"
          :class="['toolbar-btn', { active: editor.isActive('link') }]"
          title="Add Link"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </button>
        <button
          type="button"
          @click="addImage"
          class="toolbar-btn"
          title="Add Image"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button
          type="button"
          @click="addYouTube"
          class="toolbar-btn"
          title="Add YouTube Video"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        </button>
      </div>

      <!-- Markdown & Utilities -->
      <div class="flex items-center gap-1 pr-3 border-r border-gray-200">
        <button
          type="button"
          @click="pasteMarkdown"
          class="toolbar-btn"
          title="Paste Markdown (Ctrl+Shift+V)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span class="text-xs ml-1">MD</span>
        </button>
        <button
          type="button"
          @click="copyAsMarkdown"
          class="toolbar-btn"
          title="Copy as Markdown"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().setHorizontalRule().run()"
          class="toolbar-btn"
          title="Horizontal Rule"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14" />
          </svg>
        </button>
      </div>

      <!-- Undo/Redo -->
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().undo()"
          class="toolbar-btn"
          title="Undo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>
        <button
          type="button"
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().redo()"
          class="toolbar-btn"
          title="Redo"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
        </button>
      </div>

      <!-- Word Count -->
      <div class="ml-auto text-xs text-gray-400 self-center flex items-center gap-3">
        <span v-if="markdownPasted" class="text-green-600">✓ Markdown pasted</span>
        <span>{{ wordCount }} words</span>
      </div>
    </div>

    <!-- Editor Content -->
    <EditorContent 
      :editor="editor" 
      class="prose prose-amber max-w-none p-6 min-h-[400px] focus:outline-none"
    />

    <!-- Markdown Paste Modal -->
    <Teleport to="body">
      <div v-if="showMarkdownModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="fixed inset-0 bg-black/50" @click="showMarkdownModal = false"></div>
        <div class="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
          <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 class="font-bold text-gray-900">Paste Markdown</h3>
            <button @click="showMarkdownModal = false" class="p-1 hover:bg-gray-100 rounded">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="p-6">
            <textarea
              v-model="markdownInput"
              placeholder="Paste your markdown here...

# Heading
**Bold** and *italic* text

- List item 1
- List item 2

[Link](https://example.com)

![Image](https://example.com/image.jpg)"
              class="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
            ></textarea>
            <div class="flex justify-end gap-3 mt-4">
              <button 
                @click="showMarkdownModal = false"
                class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button 
                @click="insertMarkdown"
                class="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Youtube from '@tiptap/extension-youtube'
import Placeholder from '@tiptap/extension-placeholder'
import MarkdownIt from 'markdown-it'
import TurndownService from 'turndown'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

// Markdown parser
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

// HTML to Markdown converter
const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

// State
const showMarkdownModal = ref(false)
const markdownInput = ref('')
const markdownPasted = ref(false)

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [2, 3],
      },
    }),
    Underline,
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'text-amber-600 underline',
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'rounded-lg shadow-md max-w-full',
      },
    }),
    Youtube.configure({
      HTMLAttributes: {
        class: 'rounded-lg overflow-hidden my-4',
      },
      width: 640,
      height: 360,
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Start writing your story...',
    }),
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none',
    },
    // Handle paste - auto-detect markdown
    handlePaste: (view, event) => {
      const text = event.clipboardData?.getData('text/plain')
      if (text && isLikelyMarkdown(text)) {
        event.preventDefault()
        const html = md.render(text)
        editor.value?.chain().focus().insertContent(html).run()
        markdownPasted.value = true
        setTimeout(() => markdownPasted.value = false, 2000)
        return true
      }
      return false
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Detect if text looks like markdown
function isLikelyMarkdown(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers
    /\*\*[^*]+\*\*/,        // Bold
    /\*[^*]+\*/,            // Italic
    /^\s*[-*+]\s/m,         // Unordered lists
    /^\s*\d+\.\s/m,         // Ordered lists
    /\[.+\]\(.+\)/,         // Links
    /!\[.+\]\(.+\)/,        // Images
    /^>\s/m,                // Blockquotes
    /```[\s\S]*```/,        // Code blocks
    /`[^`]+`/,              // Inline code
  ]
  
  return markdownPatterns.some(pattern => pattern.test(text))
}

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (editor.value && newValue !== editor.value.getHTML()) {
    editor.value.commands.setContent(newValue, false)
  }
})

// Word count
const wordCount = computed(() => {
  if (!editor.value) return 0
  const text = editor.value.getText()
  return text.split(/\s+/).filter(word => word.length > 0).length
})

// Set link
function setLink() {
  if (!editor.value) return
  
  const previousUrl = editor.value.getAttributes('link').href
  const url = window.prompt('Enter URL:', previousUrl)
  
  if (url === null) return
  
  if (url === '') {
    editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
    return
  }
  
  editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
}

// Add image
function addImage() {
  if (!editor.value) return
  
  const url = window.prompt('Enter image URL:')
  
  if (url) {
    editor.value.chain().focus().setImage({ src: url }).run()
  }
}

// Add YouTube video
function addYouTube() {
  if (!editor.value) return
  
  const url = window.prompt('Enter YouTube URL:')
  
  if (url) {
    editor.value.chain().focus().setYoutubeVideo({ src: url }).run()
  }
}

// Paste markdown (opens modal)
function pasteMarkdown() {
  markdownInput.value = ''
  showMarkdownModal.value = true
}

// Insert markdown from modal
function insertMarkdown() {
  if (!editor.value || !markdownInput.value) return
  
  const html = md.render(markdownInput.value)
  editor.value.chain().focus().insertContent(html).run()
  
  showMarkdownModal.value = false
  markdownInput.value = ''
  markdownPasted.value = true
  setTimeout(() => markdownPasted.value = false, 2000)
}

// Copy content as markdown
async function copyAsMarkdown() {
  if (!editor.value) return
  
  const html = editor.value.getHTML()
  const markdown = turndown.turndown(html)
  
  try {
    await navigator.clipboard.writeText(markdown)
    alert('Copied as Markdown!')
  } catch (e) {
    // Fallback
    const textarea = document.createElement('textarea')
    textarea.value = markdown
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    alert('Copied as Markdown!')
  }
}

// Keyboard shortcuts
onMounted(() => {
  document.addEventListener('keydown', handleKeyboard)
})

onBeforeUnmount(() => {
  document.removeEventListener('keydown', handleKeyboard)
  editor.value?.destroy()
})

function handleKeyboard(e: KeyboardEvent) {
  // Ctrl+Shift+V = Paste Markdown modal
  if (e.ctrlKey && e.shiftKey && e.key === 'V') {
    e.preventDefault()
    pasteMarkdown()
  }
}
</script>

<style>
.tiptap-editor {
  @apply border border-gray-300 rounded-xl overflow-hidden bg-white;
}

.toolbar-btn {
  @apply p-2 rounded hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center;
}

.toolbar-btn.active {
  @apply bg-amber-100 text-amber-700;
}

/* Placeholder */
.tiptap p.is-editor-empty:first-child::before {
  @apply text-gray-400 float-left h-0 pointer-events-none;
  content: attr(data-placeholder);
}

/* Editor Styling */
.tiptap {
  @apply focus:outline-none;
}

.tiptap h2 {
  @apply text-2xl font-bold text-amber-950 mt-8 mb-4;
}

.tiptap h3 {
  @apply text-xl font-semibold text-amber-900 mt-6 mb-3;
}

.tiptap p {
  @apply text-amber-800/90 leading-relaxed mb-4;
}

.tiptap ul, .tiptap ol {
  @apply pl-6 mb-4;
}

.tiptap li {
  @apply mb-2;
}

.tiptap blockquote {
  @apply border-l-4 border-amber-400 bg-amber-50/50 pl-4 py-2 my-4 italic text-amber-800;
}

.tiptap hr {
  @apply my-8 border-amber-200;
}

.tiptap img {
  @apply rounded-xl shadow-lg my-6 max-w-full;
}

.tiptap a {
  @apply text-amber-600 underline;
}

.tiptap iframe {
  @apply rounded-lg my-6 max-w-full;
}

/* YouTube embed */
.tiptap div[data-youtube-video] {
  @apply my-6;
}

.tiptap div[data-youtube-video] iframe {
  @apply rounded-xl w-full aspect-video;
}
</style>
