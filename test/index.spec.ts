import { client } from "../src";

describe("KickClient", () => {
	const mockClient = new client({
		clientId: "test-client-id",
		clientSecret: "test-client-secret",
	});

	describe("initialization", () => {
		it("should create client with categories module", () => {
			expect(mockClient.categories).toBeDefined();
			expect(typeof mockClient.categories.getCategories).toBe("function");
			expect(typeof mockClient.categories.getCategory).toBe("function");
		});

		it("should create client with channels module", () => {
			expect(mockClient.channels).toBeDefined();
			expect(typeof mockClient.channels.getChannel).toBe("function");
			expect(typeof mockClient.channels.getChannels).toBe("function");
		});

		it("should create client with livestreams module", () => {
			expect(mockClient.livestreams).toBeDefined();
			expect(typeof mockClient.livestreams.getLivestream).toBe("function");
			expect(typeof mockClient.livestreams.getLivestreams).toBe("function");
		});

		it("should create client with chat module", () => {
			expect(mockClient.chat).toBeDefined();
			expect(typeof mockClient.chat.postMessage).toBe("function");
		});
	});
});
