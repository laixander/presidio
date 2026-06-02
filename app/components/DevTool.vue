<script setup lang="ts">
const { showDemoFab: globalShowFab, seederCount: globalSeederCount, primaryColor: globalPrimaryColor, neutralColor: globalNeutralColor } = useDevSettings()

const open = defineModel<boolean>('open')

const showFab = ref(globalShowFab.value)
const seederCount = ref(globalSeederCount.value)
const appConfig = useAppConfig()

const primaryColor = ref(appConfig.ui.colors.primary)
const neutralColor = ref(appConfig.ui.colors.neutral)

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose']
const neutrals = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'taupe', 'mauve', 'mist', 'olive']

watch(open, (isOpen) => {
  if (isOpen) {
    showFab.value = globalShowFab.value
    seederCount.value = globalSeederCount.value
    primaryColor.value = appConfig.ui.colors.primary
    neutralColor.value = appConfig.ui.colors.neutral
  }
})

const handleClose = () => {
  open.value = false
}

const handleSave = () => {
  globalShowFab.value = showFab.value
  globalSeederCount.value = seederCount.value
  
  appConfig.ui.colors.primary = primaryColor.value
  globalPrimaryColor.value = primaryColor.value
  
  appConfig.ui.colors.neutral = neutralColor.value
  globalNeutralColor.value = neutralColor.value

  open.value = false
}
</script>
<template>
  <UModal v-model:open="open" title="DevTool Settings">
    <!-- <UButton label="Open" color="neutral" variant="subtle" /> -->

    <template #body>
      <div class="w-full divide-y divide-default/50 *:flex *:justify-between *:items-center *:py-4 *:sm:py-6 *:first:pt-0 *:last:pb-0">
        <div>
        <div class="flex flex-col gap-1">
          <div class="text-sm font-semibold">Show Demo FAB</div>
          <div class="text-xs text-dimmed">Show or hide the demo floating action button</div>
        </div>
          <div class="ml-auto flex items-center gap-2">
            <USwitch v-model="showFab" />
          </div>
        </div>
        <div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-semibold">Seeder Count</span>
            <span class="text-xs text-dimmed">Number of records to seed</span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <UInputNumber v-model="seederCount" class="w-32" />
          </div>
        </div>
        <!-- Theme Color Select Box with Chip Options Label -->
        <div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-semibold">Theme Color</span>
            <span class="text-xs text-dimmed">Select primary color</span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <USelectMenu v-model="primaryColor" :items="colors" class="w-32 capitalize">
              <template #leading="{ modelValue }">
                <div v-if="modelValue" class="inline-flex items-center justify-center shrink-0 size-5">
                  <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                      '--chip-light': `var(--color-${modelValue}-500)`,
                      '--chip-dark': `var(--color-${modelValue}-400)`
                  }" />
                </div>
              </template>
              <template #item-leading="{ item }">
                <div class="inline-flex items-center justify-center shrink-0 size-5">
                  <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                      '--chip-light': `var(--color-${item}-500)`,
                      '--chip-dark': `var(--color-${item}-400)`
                  }" />
                </div>
              </template>
            </USelectMenu>
          </div>
        </div>
        <!-- Neutral Color Select Box with Chip Options Label -->
        <div>
          <div class="flex flex-col gap-1">
            <span class="text-sm font-semibold">Neutral Color</span>
            <span class="text-xs text-dimmed">Select neutral color</span>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <USelectMenu v-model="neutralColor" :items="neutrals" class="w-32 capitalize">
              <template #leading="{ modelValue }">
                <div v-if="modelValue" class="inline-flex items-center justify-center shrink-0 size-5">
                  <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                      '--chip-light': `var(--color-${modelValue === 'neutral' ? 'old-neutral' : modelValue}-500)`,
                      '--chip-dark': `var(--color-${modelValue === 'neutral' ? 'old-neutral' : modelValue}-400)`
                  }" />
                </div>
              </template>
              <template #item-leading="{ item }">
                <div class="inline-flex items-center justify-center shrink-0 size-5">
                  <span class="rounded-full ring ring-bg bg-(--chip-light) dark:bg-(--chip-dark) size-2" :style="{
                      '--chip-light': `var(--color-${item === 'neutral' ? 'old-neutral' : item}-500)`,
                      '--chip-dark': `var(--color-${item === 'neutral' ? 'old-neutral' : item}-400)`
                  }" />
                </div>
              </template>
            </USelectMenu>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton label="Close" color="neutral" variant="subtle" @click="handleClose" />
        <UButton label="Save" color="primary" variant="subtle" @click="handleSave" />
      </div>
    </template>
  </UModal>
</template>