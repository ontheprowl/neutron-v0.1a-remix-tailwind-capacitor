// Import June SDK:
import Analytics from "@june-so/analytics-node";

// Instantiate the client:
export const juneClient = new Analytics("k4JXKbVGZBPoIjPo");

/**
 * This wrapper function registers a event with a June Analytics instance
 * @param id
 * @param event
 * @param properties
 * @param category
 */
export const trackJuneEvent = (
  id: string,
  event: string,
  properties: { [x: string]: any },
  category: string,
  description = " A generic Neutron event registered on June"
) => {
  juneClient.track({
    userId: id,
    event: event,
    properties: { ...properties, description },
    context: {
      groupId: category,
    },
  });
};
