import { Env } from '../types';

export async function getQueuesStatus(env: Env) {
  const rabbitUrl = env.RABBITMQ_URL || 'amqps://ohpzywjq:T7TXF0LQIf7iqJ0ROir2mguzP-jiudBp@agile-grey-fish.rmq5.cloudamqp.com/ohpzywjq';

  try {
    // Parse connection details
    const url = new URL(rabbitUrl);
    const username = url.username;
    const password = url.password;
    const host = url.hostname;

    // Fetch queue data from RabbitMQ Management API
    const apiUrl = `https://${host}/api/queues/ohpzywjq`;
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      }
    });

    if (!response.ok) {
      throw new Error(`RabbitMQ API error: ${response.status}`);
    }

    const queues = await response.json() as any[];

    const totalMessages = queues.reduce((sum, q) => sum + (q.messages || 0), 0);
    const totalConsumers = queues.reduce((sum, q) => sum + (q.consumers || 0), 0);

    return {
      connection: {
        status: 'connected',
        host: host
      },
      summary: {
        totalQueues: queues.length,
        totalMessages,
        totalConsumers,
        queuesWithMessages: queues.filter(q => q.messages > 0).length
      },
      queues: queues.slice(0, 20).map(q => ({
        name: q.name,
        messages: q.messages || 0,
        consumers: q.consumers || 0,
        state: q.state || 'unknown',
        messagesReady: q.messages_ready || 0,
        messagesUnacknowledged: q.messages_unacknowledged || 0
      }))
    };
  } catch (error) {
    return {
      connection: {
        status: 'error',
        host: 'unknown',
        error: (error as Error).message
      },
      summary: {
        totalQueues: 0,
        totalMessages: 0,
        totalConsumers: 0,
        queuesWithMessages: 0
      },
      queues: []
    };
  }
}
