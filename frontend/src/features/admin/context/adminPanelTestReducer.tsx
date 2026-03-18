import type { AdminState, AdminTestInput } from "../types";
import { createId, normalizeQuestions } from "./adminPanelHelpers";

export const createTestReducer = (state: AdminState, payload: AdminTestInput): AdminState => {
    const now = new Date().toISOString();
    const id = createId("test");
    const nextTest = {
        id,
        ...payload,
        questions: normalizeQuestions(payload.questions, id),
        createdAt: now,
        updatedAt: now,
    };
    return { ...state, tests: [nextTest, ...state.tests] };
};

export const updateTestReducer = (state: AdminState, payload: { id: string; data: AdminTestInput }): AdminState => {
    const now = new Date().toISOString();
    return {
        ...state,
        tests: state.tests.map((test) =>
            test.id !== payload.id
                ? test
                : {
                      ...test,
                      ...payload.data,
                      questions: normalizeQuestions(payload.data.questions, test.id),
                      updatedAt: now,
                  }
        ),
    };
};

export const deleteTestReducer = (state: AdminState, payload: { id: string }): AdminState => {
    return { ...state, tests: state.tests.filter((test) => test.id !== payload.id) };
};
