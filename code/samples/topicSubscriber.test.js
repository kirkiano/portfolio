import {logger} from './logger.js';
import {TopicSubscriber} from './topicSubscriber.js';
import {test, expect} from '@jest/globals';


/*
 * Some tests of the object that associates each topic with
 * its set of subscribers.
*/

test('topic existence is correctly recognized', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  tr.createTopic(topic);
  expect(tr.topicExists(topic)).toBeTruthy();
  expect(tr.topics().includes(topic)).toBeTruthy();
  expect(() => tr.assertTopicDoesNotExist(topic))
    .toThrow(TopicSubscriber.TopicAlreadyExists);
  expect(tr.subscribersOf(topic).size).toEqual(0);
});


test('topic nonexistence is correctly recognized', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  expect(tr.topicExists(topic)).toBeFalsy();
  expect(topic in tr.topics()).toBeFalsy();
  expect(() => tr.assertTopicExists(topic))
    .toThrow(TopicSubscriber.NoSuchTopic);
});


test('topic cannot be created twice', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  tr.createTopic(topic);
  expect(() => tr.createTopic(topic))
    .toThrow(TopicSubscriber.TopicAlreadyExists);
});


test('cannot subscribe to nonexistent topic', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  let senderId = 42;
  expect(() => tr.subscribe(senderId, topic))
    .toThrow(TopicSubscriber.NoSuchTopic);
});


test('subscribe', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  tr.createTopic(topic);

  let sid = 42;
  expect(tr.subscribers().includes(sid.toString())).toBeFalsy();
  expect(tr.subscribersOf(topic).has(sid)).toBeFalsy();

  tr.subscribe(sid, topic);
  expect(tr.isSubscribed(sid, topic)).toBeTruthy();
  expect(tr.topicsOf(sid).has(topic)).toBeTruthy();
  expect(tr.subscribersOf(topic).has(sid)).toBeTruthy();
  expect(tr.subscribers().includes(sid.toString())).toBeTruthy();
});


test('unsubscribe', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  let sid = 42;
  tr.createTopic(topic);
  tr.subscribe(sid, topic);
  tr.unsubscribe(sid, topic);
  expect(tr.subscribersOf(topic).has(sid)).toBeFalsy();
  expect(tr.subscribers().includes(sid.toString())).toBeFalsy();
});


test('cannot unsubscribe from nonexistent topic', () => {
  let tr = new TopicSubscriber(logger);
  let topic1 = 'foo';
  let topic2 = 'bar';
  let sid = 42;
  tr.createTopic(topic1);
  tr.subscribe(sid, topic1);
  expect(() => tr.unsubscribe(sid, topic2))
    .toThrow(TopicSubscriber.NoSuchTopic)
});


test('cannot unsubscribe a nonexistent user', () => {
  let tr = new TopicSubscriber(logger);
  let topic = 'foo';
  let sid = 42;
  tr.createTopic(topic);
  expect(() => tr.unsubscribe(sid, topic))
    .toThrow(TopicSubscriber.NotSubscribed)
});
