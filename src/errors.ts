export class KickApiError extends Error {
	public readonly status: number;
	public readonly responseBody?: any;
	public readonly headers?: Record<string, string>;
	public readonly endpoint?: string;

	constructor(
		message: string,
		status: number,
		responseBody?: any,
		headers?: Record<string, string>,
		endpoint?: string,
	) {
		super(message);
		this.name = "KickApiError";
		this.status = status;
		this.responseBody = responseBody;
		this.headers = headers;
		this.endpoint = endpoint;

		Object.setPrototypeOf(this, KickApiError.prototype);
	}

	toJSON() {
		return {
			name: this.name,
			message: this.message,
			status: this.status,
			responseBody: this.responseBody,
			headers: this.headers,
			endpoint: this.endpoint,
		};
	}
}

export class KickOAuthError extends KickApiError {
	constructor(message: string, status: number, responseBody?: any) {
		super(`OAuth Error: ${message}`, status, responseBody);
		this.name = "KickOAuthError";
		Object.setPrototypeOf(this, KickOAuthError.prototype);
	}
}

export class KickBadRequestError extends KickApiError {
	constructor(message: string, responseBody?: any, endpoint?: string) {
		super(`Bad Request: ${message}`, 400, responseBody, undefined, endpoint);
		this.name = "KickBadRequestError";
		Object.setPrototypeOf(this, KickBadRequestError.prototype);
	}
}

export class KickUnauthorizedError extends KickApiError {
	constructor(
		message: string = "Unauthorized - Invalid or expired credentials",
		responseBody?: any,
		endpoint?: string,
	) {
		super(`Unauthorized: ${message}`, 401, responseBody, undefined, endpoint);
		this.name = "KickUnauthorizedError";
		Object.setPrototypeOf(this, KickUnauthorizedError.prototype);
	}
}

export class KickForbiddenError extends KickApiError {
	constructor(message: string = "Forbidden - Access denied", responseBody?: any, endpoint?: string) {
		super(`Forbidden: ${message}`, 403, responseBody, undefined, endpoint);
		this.name = "KickForbiddenError";
		Object.setPrototypeOf(this, KickForbiddenError.prototype);
	}
}

export class KickNotFoundError extends KickApiError {
	constructor(message: string = "Resource not found", responseBody?: any, endpoint?: string) {
		super(`Not Found: ${message}`, 404, responseBody, undefined, endpoint);
		this.name = "KickNotFoundError";
		Object.setPrototypeOf(this, KickNotFoundError.prototype);
	}
}

export class KickRateLimitError extends KickApiError {
	public readonly retryAfter?: number;

	constructor(message: string = "Rate limit exceeded", responseBody?: any, retryAfter?: number, endpoint?: string) {
		super(`Rate Limited: ${message}`, 429, responseBody, undefined, endpoint);
		this.name = "KickRateLimitError";
		this.retryAfter = retryAfter;
		Object.setPrototypeOf(this, KickRateLimitError.prototype);
	}
}

export class KickServerError extends KickApiError {
	constructor(message: string = "Internal server error", status: number = 500, responseBody?: any, endpoint?: string) {
		super(`Server Error: ${message}`, status, responseBody, undefined, endpoint);
		this.name = "KickServerError";
		Object.setPrototypeOf(this, KickServerError.prototype);
	}
}

export class KickNetworkError extends Error {
	public readonly originalError: Error;

	constructor(message: string, originalError: Error) {
		super(`Network Error: ${message}`);
		this.name = "KickNetworkError";
		this.originalError = originalError;
		Object.setPrototypeOf(this, KickNetworkError.prototype);
	}
}

export function createKickError(
	status: number,
	statusText: string,
	responseBody?: any,
	headers?: Record<string, string>,
	endpoint?: string,
): KickApiError {
	const message = `${status} ${statusText}`;

	switch (status) {
		case 400:
			return new KickBadRequestError(message, responseBody, endpoint);
		case 401:
			return new KickUnauthorizedError(message, responseBody, endpoint);
		case 403:
			return new KickForbiddenError(message, responseBody, endpoint);
		case 404:
			return new KickNotFoundError(message, responseBody, endpoint);
		case 429:
			const retryAfter = headers?.["retry-after"] ? parseInt(headers["retry-after"]) : undefined;
			return new KickRateLimitError(message, responseBody, retryAfter, endpoint);
		case 500:
		case 502:
		case 503:
		case 504:
			return new KickServerError(message, status, responseBody, endpoint);
		default:
			return new KickApiError(message, status, responseBody, headers, endpoint);
	}
}
