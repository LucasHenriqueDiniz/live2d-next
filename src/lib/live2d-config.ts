/**
 * Configurações do Live2D baseadas no exemplo oficial do SDK
 */

// Configurações do canvas
export const CANVAS_SIZE = { width: 600, height: 800 };

// Configurações de visualização
export const VIEW_SCALE = 1.0;
export const VIEW_MAX_SCALE = 2.0;
export const VIEW_MIN_SCALE = 0.8;

export const VIEW_LOGICAL_LEFT = -1.0;
export const VIEW_LOGICAL_RIGHT = 1.0;
export const VIEW_LOGICAL_BOTTOM = -1.0;
export const VIEW_LOGICAL_TOP = 1.0;

export const VIEW_LOGICAL_MAX_LEFT = -2.0;
export const VIEW_LOGICAL_MAX_RIGHT = 2.0;
export const VIEW_LOGICAL_MAX_BOTTOM = -2.0;
export const VIEW_LOGICAL_MAX_TOP = 2.0;

// Caminhos dos recursos
export const RESOURCES_PATH = "/models/";

// Modelos disponíveis
export const MODEL_DIRS = ["shizuku", "hiyori_free_en"];

// Grupos de movimento
export const MOTION_GROUP_IDLE = "Idle";
export const MOTION_GROUP_TAP_BODY = "TapBody";

// Áreas de hit
export const HIT_AREA_NAME_HEAD = "Head";
export const HIT_AREA_NAME_BODY = "Body";

// Prioridades de movimento
export const PRIORITY_NONE = 0;
export const PRIORITY_IDLE = 1;
export const PRIORITY_NORMAL = 2;
export const PRIORITY_FORCE = 3;

// Configurações de debug
export const DEBUG_LOG_ENABLE = true;
export const DEBUG_TOUCH_LOG_ENABLE = false;

// Configurações de renderização
export const RENDER_TARGET_WIDTH = 1900;
export const RENDER_TARGET_HEIGHT = 1000;
