import {createUrl} from "./engine";

describe("createUrl", () => {
  it('should create url without parameters', function () {
    expect(createUrl("/my/path", {})).toBe("/my/path")
  });
  it('should create url with regular path parameters', function () {
    expect(createUrl("/my/path/{value}", {path: {value: 'test'}})).toBe("/my/path/test")
  });
  it('should create url with path parameters containing special characters', function () {
    expect(createUrl("/my/path/{value}", {path: {value: 'test#1'}})).toBe("/my/path/test%231")
  });
  it('should create url with regular query parameters', function () {
    expect(createUrl("/my/path", {query: {value: 'test'}})).toBe('/my/path?value=test')
  });
  it('should create url with query parameters containing special characters', function () {
    expect(createUrl("/my/path", {query: {value: 'test#1'}})).toBe('/my/path?value=test%231')
  });
  it('should create url with multiple query parameters', function () {
    expect(createUrl("/my/path", {query: {name: 'user', age: 18}})).toBe('/my/path?name=user&age=18')
  });
  it('should create url with multiple query parameters with special characters', function () {
    expect(createUrl("/my/path", {query: {name: 'user?name', age: 18}})).toBe('/my/path?name=user%3Fname&age=18')
  });
})

export {}
