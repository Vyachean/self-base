import type { MaybeRef } from 'vue';
import { onBeforeUnmount, computed, watch } from 'vue';
import { toValue, unrefElement, type MaybeElementRef } from '@vueuse/core';
import { throttle } from 'lodash-es';

type EventTypes = keyof WindowEventMap;

type InteractionOutsideOptions = {
  ignore?: MaybeRef<MaybeElementRef[]>;
  events?: EventTypes[]; // Типизация событий на основе WindowEventMap
  throttleWait?: number; // Опция для троттлинга
};

export const onInteractionOutside = (
  target: MaybeElementRef, // Массив targetRef
  callback: () => void,
  options: InteractionOutsideOptions = {},
) => {
  const {
    events = ['click', 'touchstart', 'keydown', 'visibilitychange', 'wheel'],
    throttleWait = 1e3 / 3,
    ignore = [],
  } = options;

  const handleInteraction = throttle((event: Event) => {
    const eventTarget = event.target instanceof Node ? event.target : undefined;
    if (!eventTarget) {
      return;
    }

    const ignoreList = toValue(ignore).map(unrefElement);

    const containers = [unrefElement(target), ...ignoreList];

    const isInside = containers.some(
      (container) =>
        container == eventTarget || container?.contains(eventTarget),
    );

    if (!isInside) {
      callback();
    }
  }, throttleWait);

  const hasTarget = computed(() => !!unrefElement(target));

  watch(
    hasTarget,
    (hasTarget) => {
      if (hasTarget) {
        events.forEach((event) => {
          window.addEventListener(event, handleInteraction, true);
        });
      } else {
        events.forEach((event) => {
          window.removeEventListener(event, handleInteraction, true);
        });
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    events.forEach((event) => {
      window.removeEventListener(event, handleInteraction, true);
    });
  });
};
