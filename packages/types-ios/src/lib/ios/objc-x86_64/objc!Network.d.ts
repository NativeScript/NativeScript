
interface OS_nw_advertise_descriptor extends NSObjectProtocol {
}
declare var OS_nw_advertise_descriptor: {

	prototype: OS_nw_advertise_descriptor;
};

interface OS_nw_browse_descriptor extends NSObjectProtocol {
}
declare var OS_nw_browse_descriptor: {

	prototype: OS_nw_browse_descriptor;
};

interface OS_nw_browse_result extends NSObjectProtocol {
}
declare var OS_nw_browse_result: {

	prototype: OS_nw_browse_result;
};

interface OS_nw_browser extends NSObjectProtocol {
}
declare var OS_nw_browser: {

	prototype: OS_nw_browser;
};

interface OS_nw_connection extends NSObjectProtocol {
}
declare var OS_nw_connection: {

	prototype: OS_nw_connection;
};

interface OS_nw_connection_group extends NSObjectProtocol {
}
declare var OS_nw_connection_group: {

	prototype: OS_nw_connection_group;
};

interface OS_nw_content_context extends NSObjectProtocol {
}
declare var OS_nw_content_context: {

	prototype: OS_nw_content_context;
};

interface OS_nw_data_transfer_report extends NSObjectProtocol {
}
declare var OS_nw_data_transfer_report: {

	prototype: OS_nw_data_transfer_report;
};

interface OS_nw_endpoint extends NSObjectProtocol {
}
declare var OS_nw_endpoint: {

	prototype: OS_nw_endpoint;
};

interface OS_nw_error extends NSObjectProtocol {
}
declare var OS_nw_error: {

	prototype: OS_nw_error;
};

interface OS_nw_establishment_report extends NSObjectProtocol {
}
declare var OS_nw_establishment_report: {

	prototype: OS_nw_establishment_report;
};

interface OS_nw_ethernet_channel extends NSObjectProtocol {
}
declare var OS_nw_ethernet_channel: {

	prototype: OS_nw_ethernet_channel;
};

interface OS_nw_framer extends NSObjectProtocol {
}
declare var OS_nw_framer: {

	prototype: OS_nw_framer;
};

interface OS_nw_group_descriptor extends NSObjectProtocol {
}
declare var OS_nw_group_descriptor: {

	prototype: OS_nw_group_descriptor;
};

interface OS_nw_interface extends NSObjectProtocol {
}
declare var OS_nw_interface: {

	prototype: OS_nw_interface;
};

interface OS_nw_listener extends NSObjectProtocol {
}
declare var OS_nw_listener: {

	prototype: OS_nw_listener;
};

interface OS_nw_object extends NSObjectProtocol {
}
declare var OS_nw_object: {

	prototype: OS_nw_object;
};

interface OS_nw_parameters extends NSObjectProtocol {
}
declare var OS_nw_parameters: {

	prototype: OS_nw_parameters;
};

interface OS_nw_path extends NSObjectProtocol {
}
declare var OS_nw_path: {

	prototype: OS_nw_path;
};

interface OS_nw_path_monitor extends NSObjectProtocol {
}
declare var OS_nw_path_monitor: {

	prototype: OS_nw_path_monitor;
};

interface OS_nw_privacy_context extends NSObjectProtocol {
}
declare var OS_nw_privacy_context: {

	prototype: OS_nw_privacy_context;
};

interface OS_nw_protocol_definition extends NSObjectProtocol {
}
declare var OS_nw_protocol_definition: {

	prototype: OS_nw_protocol_definition;
};

interface OS_nw_protocol_metadata extends NSObjectProtocol {
}
declare var OS_nw_protocol_metadata: {

	prototype: OS_nw_protocol_metadata;
};

interface OS_nw_protocol_options extends NSObjectProtocol {
}
declare var OS_nw_protocol_options: {

	prototype: OS_nw_protocol_options;
};

interface OS_nw_protocol_stack extends NSObjectProtocol {
}
declare var OS_nw_protocol_stack: {

	prototype: OS_nw_protocol_stack;
};

interface OS_nw_proxy_config extends NSObjectProtocol {
}
declare var OS_nw_proxy_config: {

	prototype: OS_nw_proxy_config;
};

interface OS_nw_relay_hop extends NSObjectProtocol {
}
declare var OS_nw_relay_hop: {

	prototype: OS_nw_relay_hop;
};

interface OS_nw_resolution_report extends NSObjectProtocol {
}
declare var OS_nw_resolution_report: {

	prototype: OS_nw_resolution_report;
};

interface OS_nw_resolver_config extends NSObjectProtocol {
}
declare var OS_nw_resolver_config: {

	prototype: OS_nw_resolver_config;
};

interface OS_nw_txt_record extends NSObjectProtocol {
}
declare var OS_nw_txt_record: {

	prototype: OS_nw_txt_record;
};

interface OS_nw_ws_request extends NSObjectProtocol {
}
declare var OS_nw_ws_request: {

	prototype: OS_nw_ws_request;
};

interface OS_nw_ws_response extends NSObjectProtocol {
}
declare var OS_nw_ws_response: {

	prototype: OS_nw_ws_response;
};

/**
 * @since 12.0
 */
declare var _nw_connection_send_idempotent_content: (p1: NSObject & OS_nw_error) => void;

/**
 * @since 12.0
 */
declare var _nw_content_context_default_message: NSObject & OS_nw_content_context;

/**
 * @since 12.0
 */
declare var _nw_content_context_default_stream: NSObject & OS_nw_content_context;

/**
 * @since 12.0
 */
declare var _nw_content_context_final_send: NSObject & OS_nw_content_context;

/**
 * @since 13.0
 */
declare var _nw_data_transfer_report_all_paths: number;

/**
 * @since 12.0
 */
declare var _nw_parameters_configure_protocol_default_configuration: (p1: NSObject & OS_nw_protocol_options) => void;

/**
 * @since 12.0
 */
declare var _nw_parameters_configure_protocol_disable: (p1: NSObject & OS_nw_protocol_options) => void;

/**
 * @since 14.0
 */
declare var _nw_privacy_context_default_context: NSObject & OS_nw_privacy_context;

/**
 * @since 12.0
 */
declare var kNWErrorDomainDNS: string;

/**
 * @since 12.0
 */
declare var kNWErrorDomainPOSIX: string;

/**
 * @since 12.0
 */
declare var kNWErrorDomainTLS: string;

/**
 * @since 26.0
 */
declare var kNWErrorDomainWiFiAware: string;

/**
 * @since 13.0
 */
declare function nw_advertise_descriptor_copy_txt_record_object(advertise_descriptor: NSObject & OS_nw_advertise_descriptor): NSObject & OS_nw_txt_record;

/**
 * @since 16.0
 */
declare function nw_advertise_descriptor_create_application_service(application_service_name: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_advertise_descriptor;

/**
 * @since 12.0
 */
declare function nw_advertise_descriptor_create_bonjour_service(name: string | interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_advertise_descriptor;

/**
 * @since 16.0
 */
declare function nw_advertise_descriptor_get_application_service_name(advertise_descriptor: NSObject & OS_nw_advertise_descriptor): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_advertise_descriptor_get_no_auto_rename(advertise_descriptor: NSObject & OS_nw_advertise_descriptor): boolean;

/**
 * @since 12.0
 */
declare function nw_advertise_descriptor_set_no_auto_rename(advertise_descriptor: NSObject & OS_nw_advertise_descriptor, no_auto_rename: boolean): void;

/**
 * @since 12.0
 */
declare function nw_advertise_descriptor_set_txt_record(advertise_descriptor: NSObject & OS_nw_advertise_descriptor, txt_record: interop.Pointer | interop.Reference<any>, txt_length: number): void;

/**
 * @since 13.0
 */
declare function nw_advertise_descriptor_set_txt_record_object(advertise_descriptor: NSObject & OS_nw_advertise_descriptor, txt_record: NSObject & OS_nw_txt_record): void;

/**
 * @since 16.0
 */
declare function nw_browse_descriptor_create_application_service(application_service_name: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_browse_descriptor;

/**
 * @since 13.0
 */
declare function nw_browse_descriptor_create_bonjour_service(type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_browse_descriptor;

/**
 * @since 16.0
 */
declare function nw_browse_descriptor_get_application_service_name(descriptor: NSObject & OS_nw_browse_descriptor): interop.Pointer | interop.Reference<any>;

/**
 * @since 13.0
 */
declare function nw_browse_descriptor_get_bonjour_service_domain(descriptor: NSObject & OS_nw_browse_descriptor): interop.Pointer | interop.Reference<any>;

/**
 * @since 13.0
 */
declare function nw_browse_descriptor_get_bonjour_service_type(descriptor: NSObject & OS_nw_browse_descriptor): interop.Pointer | interop.Reference<any>;

/**
 * @since 13.0
 */
declare function nw_browse_descriptor_get_include_txt_record(descriptor: NSObject & OS_nw_browse_descriptor): boolean;

/**
 * @since 13.0
 */
declare function nw_browse_descriptor_set_include_txt_record(descriptor: NSObject & OS_nw_browse_descriptor, include_txt_record: boolean): void;

declare const nw_browse_result_change_identical: number;

declare const nw_browse_result_change_interface_added: number;

declare const nw_browse_result_change_interface_removed: number;

declare const nw_browse_result_change_invalid: number;

declare const nw_browse_result_change_result_added: number;

declare const nw_browse_result_change_result_removed: number;

declare const nw_browse_result_change_txt_record_changed: number;

/**
 * @since 13.0
 */
declare function nw_browse_result_copy_endpoint(result: NSObject & OS_nw_browse_result): NSObject & OS_nw_endpoint;

/**
 * @since 13.0
 */
declare function nw_browse_result_copy_txt_record_object(result: NSObject & OS_nw_browse_result): NSObject & OS_nw_txt_record;

/**
 * @since 13.0
 */
declare function nw_browse_result_enumerate_interfaces(result: NSObject & OS_nw_browse_result, enumerator: (p1: NSObject & OS_nw_interface) => boolean): void;

/**
 * @since 13.0
 */
declare function nw_browse_result_get_changes(old_result: NSObject & OS_nw_browse_result, new_result: NSObject & OS_nw_browse_result): number;

/**
 * @since 13.0
 */
declare function nw_browse_result_get_interfaces_count(result: NSObject & OS_nw_browse_result): number;

/**
 * @since 13.0
 */
declare function nw_browser_cancel(browser: NSObject & OS_nw_browser): void;

/**
 * @since 13.0
 */
declare function nw_browser_copy_browse_descriptor(browser: NSObject & OS_nw_browser): NSObject & OS_nw_browse_descriptor;

/**
 * @since 13.0
 */
declare function nw_browser_copy_parameters(browser: NSObject & OS_nw_browser): NSObject & OS_nw_parameters;

/**
 * @since 13.0
 */
declare function nw_browser_create(descriptor: NSObject & OS_nw_browse_descriptor, parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_browser;

/**
 * @since 13.0
 */
declare function nw_browser_set_browse_results_changed_handler(browser: NSObject & OS_nw_browser, handler: (p1: NSObject & OS_nw_browse_result, p2: NSObject & OS_nw_browse_result, p3: boolean) => void): void;

/**
 * @since 13.0
 */
declare function nw_browser_set_queue(browser: NSObject & OS_nw_browser, queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 13.0
 */
declare function nw_browser_set_state_changed_handler(browser: NSObject & OS_nw_browser, state_changed_handler: (p1: nw_browser_state_t, p2: NSObject & OS_nw_error) => void): void;

/**
 * @since 13.0
 */
declare function nw_browser_start(browser: NSObject & OS_nw_browser): void;

declare const enum nw_browser_state_t {

	nw_browser_state_invalid = 0,

	nw_browser_state_ready = 1,

	nw_browser_state_failed = 2,

	nw_browser_state_cancelled = 3,

	nw_browser_state_waiting = 4
}

/**
 * @since 13.0
 */
declare function nw_connection_access_establishment_report(connection: NSObject & OS_nw_connection, queue: NSObject & OS_dispatch_queue, access_block: (p1: NSObject & OS_nw_establishment_report) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_batch(connection: NSObject & OS_nw_connection, batch_block: () => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_cancel(connection: NSObject & OS_nw_connection): void;

/**
 * @since 12.0
 */
declare function nw_connection_cancel_current_endpoint(connection: NSObject & OS_nw_connection): void;

/**
 * @since 12.0
 */
declare function nw_connection_copy_current_path(connection: NSObject & OS_nw_connection): NSObject & OS_nw_path;

/**
 * @since 12.0
 */
declare function nw_connection_copy_description(connection: NSObject & OS_nw_connection): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_connection_copy_endpoint(connection: NSObject & OS_nw_connection): NSObject & OS_nw_endpoint;

/**
 * @since 12.0
 */
declare function nw_connection_copy_parameters(connection: NSObject & OS_nw_connection): NSObject & OS_nw_parameters;

/**
 * @since 12.0
 */
declare function nw_connection_copy_protocol_metadata(connection: NSObject & OS_nw_connection, definition: NSObject & OS_nw_protocol_definition): NSObject & OS_nw_protocol_metadata;

/**
 * @since 12.0
 */
declare function nw_connection_create(endpoint: NSObject & OS_nw_endpoint, parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_connection;

/**
 * @since 13.0
 */
declare function nw_connection_create_new_data_transfer_report(connection: NSObject & OS_nw_connection): NSObject & OS_nw_data_transfer_report;

/**
 * @since 12.0
 */
declare function nw_connection_force_cancel(connection: NSObject & OS_nw_connection): void;

/**
 * @since 12.0
 */
declare function nw_connection_get_maximum_datagram_size(connection: NSObject & OS_nw_connection): number;

/**
 * @since 14.0
 */
declare function nw_connection_group_cancel(group: NSObject & OS_nw_connection_group): void;

/**
 * @since 14.0
 */
declare function nw_connection_group_copy_descriptor(group: NSObject & OS_nw_connection_group): NSObject & OS_nw_group_descriptor;

/**
 * @since 14.0
 */
declare function nw_connection_group_copy_local_endpoint_for_message(group: NSObject & OS_nw_connection_group, context: NSObject & OS_nw_content_context): NSObject & OS_nw_endpoint;

/**
 * @since 14.0
 */
declare function nw_connection_group_copy_parameters(group: NSObject & OS_nw_connection_group): NSObject & OS_nw_parameters;

/**
 * @since 14.0
 */
declare function nw_connection_group_copy_path_for_message(group: NSObject & OS_nw_connection_group, context: NSObject & OS_nw_content_context): NSObject & OS_nw_path;

/**
 * @since 15.0
 */
declare function nw_connection_group_copy_protocol_metadata(group: NSObject & OS_nw_connection_group, definition: NSObject & OS_nw_protocol_definition): NSObject & OS_nw_protocol_metadata;

/**
 * @since 15.0
 */
declare function nw_connection_group_copy_protocol_metadata_for_message(group: NSObject & OS_nw_connection_group, context: NSObject & OS_nw_content_context, definition: NSObject & OS_nw_protocol_definition): NSObject & OS_nw_protocol_metadata;

/**
 * @since 14.0
 */
declare function nw_connection_group_copy_remote_endpoint_for_message(group: NSObject & OS_nw_connection_group, context: NSObject & OS_nw_content_context): NSObject & OS_nw_endpoint;

/**
 * @since 14.0
 */
declare function nw_connection_group_create(group_descriptor: NSObject & OS_nw_group_descriptor, parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_connection_group;

/**
 * @since 15.0
 */
declare function nw_connection_group_extract_connection(group: NSObject & OS_nw_connection_group, endpoint: NSObject & OS_nw_endpoint, protocol_options: NSObject & OS_nw_protocol_options): NSObject & OS_nw_connection;

/**
 * @since 14.0
 */
declare function nw_connection_group_extract_connection_for_message(group: NSObject & OS_nw_connection_group, context: NSObject & OS_nw_content_context): NSObject & OS_nw_connection;

/**
 * @since 15.0
 */
declare function nw_connection_group_reinsert_extracted_connection(group: NSObject & OS_nw_connection_group, connection: NSObject & OS_nw_connection): boolean;

/**
 * @since 14.0
 */
declare function nw_connection_group_reply(group: NSObject & OS_nw_connection_group, inbound_message: NSObject & OS_nw_content_context, outbound_message: NSObject & OS_nw_content_context, content: NSObject & OS_dispatch_data): void;

/**
 * @since 14.0
 */
declare function nw_connection_group_send_message(group: NSObject & OS_nw_connection_group, content: NSObject & OS_dispatch_data, endpoint: NSObject & OS_nw_endpoint, context: NSObject & OS_nw_content_context, completion: (p1: NSObject & OS_nw_error) => void): void;

/**
 * @since 15.0
 */
declare function nw_connection_group_set_new_connection_handler(group: NSObject & OS_nw_connection_group, new_connection_handler: (p1: NSObject & OS_nw_connection) => void): void;

/**
 * @since 14.0
 */
declare function nw_connection_group_set_queue(group: NSObject & OS_nw_connection_group, queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 14.0
 */
declare function nw_connection_group_set_receive_handler(group: NSObject & OS_nw_connection_group, maximum_message_size: number, reject_oversized_messages: boolean, receive_handler: (p1: NSObject & OS_dispatch_data, p2: NSObject & OS_nw_content_context, p3: boolean) => void): void;

/**
 * @since 14.0
 */
declare function nw_connection_group_set_state_changed_handler(group: NSObject & OS_nw_connection_group, state_changed_handler: (p1: nw_connection_group_state_t, p2: NSObject & OS_nw_error) => void): void;

/**
 * @since 14.0
 */
declare function nw_connection_group_start(group: NSObject & OS_nw_connection_group): void;

declare const enum nw_connection_group_state_t {

	nw_connection_group_state_invalid = 0,

	nw_connection_group_state_waiting = 1,

	nw_connection_group_state_ready = 2,

	nw_connection_group_state_failed = 3,

	nw_connection_group_state_cancelled = 4
}

/**
 * @since 12.0
 */
declare function nw_connection_receive(connection: NSObject & OS_nw_connection, minimum_incomplete_length: number, maximum_length: number, completion: (p1: NSObject & OS_dispatch_data, p2: NSObject & OS_nw_content_context, p3: boolean, p4: NSObject & OS_nw_error) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_receive_message(connection: NSObject & OS_nw_connection, completion: (p1: NSObject & OS_dispatch_data, p2: NSObject & OS_nw_content_context, p3: boolean, p4: NSObject & OS_nw_error) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_restart(connection: NSObject & OS_nw_connection): void;

/**
 * @since 12.0
 */
declare function nw_connection_send(connection: NSObject & OS_nw_connection, content: NSObject & OS_dispatch_data, context: NSObject & OS_nw_content_context, is_complete: boolean, completion: (p1: NSObject & OS_nw_error) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_set_better_path_available_handler(connection: NSObject & OS_nw_connection, handler: (p1: boolean) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_set_path_changed_handler(connection: NSObject & OS_nw_connection, handler: (p1: NSObject & OS_nw_path) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_set_queue(connection: NSObject & OS_nw_connection, queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 12.0
 */
declare function nw_connection_set_state_changed_handler(connection: NSObject & OS_nw_connection, handler: (p1: nw_connection_state_t, p2: NSObject & OS_nw_error) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_set_viability_changed_handler(connection: NSObject & OS_nw_connection, handler: (p1: boolean) => void): void;

/**
 * @since 12.0
 */
declare function nw_connection_start(connection: NSObject & OS_nw_connection): void;

declare const enum nw_connection_state_t {

	nw_connection_state_invalid = 0,

	nw_connection_state_waiting = 1,

	nw_connection_state_preparing = 2,

	nw_connection_state_ready = 3,

	nw_connection_state_failed = 4,

	nw_connection_state_cancelled = 5
}

/**
 * @since 12.0
 */
declare function nw_content_context_copy_antecedent(context: NSObject & OS_nw_content_context): NSObject & OS_nw_content_context;

/**
 * @since 12.0
 */
declare function nw_content_context_copy_protocol_metadata(context: NSObject & OS_nw_content_context, protocol: NSObject & OS_nw_protocol_definition): NSObject & OS_nw_protocol_metadata;

/**
 * @since 12.0
 */
declare function nw_content_context_create(context_identifier: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_content_context;

/**
 * @since 12.0
 */
declare function nw_content_context_foreach_protocol_metadata(context: NSObject & OS_nw_content_context, foreach_block: (p1: NSObject & OS_nw_protocol_definition, p2: NSObject & OS_nw_protocol_metadata) => void): void;

/**
 * @since 12.0
 */
declare function nw_content_context_get_expiration_milliseconds(context: NSObject & OS_nw_content_context): number;

/**
 * @since 12.0
 */
declare function nw_content_context_get_identifier(context: NSObject & OS_nw_content_context): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_content_context_get_is_final(context: NSObject & OS_nw_content_context): boolean;

/**
 * @since 12.0
 */
declare function nw_content_context_get_relative_priority(context: NSObject & OS_nw_content_context): number;

/**
 * @since 12.0
 */
declare function nw_content_context_set_antecedent(context: NSObject & OS_nw_content_context, antecedent_context: NSObject & OS_nw_content_context): void;

/**
 * @since 12.0
 */
declare function nw_content_context_set_expiration_milliseconds(context: NSObject & OS_nw_content_context, expiration_milliseconds: number): void;

/**
 * @since 12.0
 */
declare function nw_content_context_set_is_final(context: NSObject & OS_nw_content_context, is_final: boolean): void;

/**
 * @since 12.0
 */
declare function nw_content_context_set_metadata_for_protocol(context: NSObject & OS_nw_content_context, protocol_metadata: NSObject & OS_nw_protocol_metadata): void;

/**
 * @since 12.0
 */
declare function nw_content_context_set_relative_priority(context: NSObject & OS_nw_content_context, relative_priority: number): void;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_collect(report: NSObject & OS_nw_data_transfer_report, queue: NSObject & OS_dispatch_queue, collect_block: (p1: NSObject & OS_nw_data_transfer_report) => void): void;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_copy_path_interface(report: NSObject & OS_nw_data_transfer_report, path_index: number): NSObject & OS_nw_interface;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_duration_milliseconds(report: NSObject & OS_nw_data_transfer_report): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_path_count(report: NSObject & OS_nw_data_transfer_report): number;

/**
 * @since 15.0
 */
declare function nw_data_transfer_report_get_path_radio_type(report: NSObject & OS_nw_data_transfer_report, path_index: number): nw_interface_radio_type_t;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_received_application_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_received_ip_packet_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_received_transport_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_received_transport_duplicate_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_received_transport_out_of_order_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_sent_application_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_sent_ip_packet_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_sent_transport_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_sent_transport_retransmitted_byte_count(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_state(report: NSObject & OS_nw_data_transfer_report): nw_data_transfer_report_state_t;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_transport_minimum_rtt_milliseconds(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_transport_rtt_variance(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

/**
 * @since 13.0
 */
declare function nw_data_transfer_report_get_transport_smoothed_rtt_milliseconds(report: NSObject & OS_nw_data_transfer_report, path_index: number): number;

declare const enum nw_data_transfer_report_state_t {

	nw_data_transfer_report_state_collecting = 1,

	nw_data_transfer_report_state_collected = 2
}

/**
 * @since 12.0
 */
declare function nw_endpoint_copy_address_string(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_endpoint_copy_port_string(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

/**
 * @since 16.0
 */
declare function nw_endpoint_copy_txt_record(endpoint: NSObject & OS_nw_endpoint): NSObject & OS_nw_txt_record;

/**
 * @since 12.0
 */
declare function nw_endpoint_create_address(address: interop.Pointer | interop.Reference<sockaddr>): NSObject & OS_nw_endpoint;

/**
 * @since 12.0
 */
declare function nw_endpoint_create_bonjour_service(name: string | interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_endpoint;

/**
 * @since 12.0
 */
declare function nw_endpoint_create_host(hostname: string | interop.Pointer | interop.Reference<any>, port: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_endpoint;

/**
 * @since 13.0
 */
declare function nw_endpoint_create_url(url: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_endpoint;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_address(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<sockaddr>;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_bonjour_service_domain(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_bonjour_service_name(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_bonjour_service_type(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_hostname(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_port(endpoint: NSObject & OS_nw_endpoint): number;

/**
 * @since 16.0
 */
declare function nw_endpoint_get_signature(endpoint: NSObject & OS_nw_endpoint, out_signature_length: interop.Pointer | interop.Reference<number>): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_endpoint_get_type(endpoint: NSObject & OS_nw_endpoint): nw_endpoint_type_t;

/**
 * @since 13.0
 */
declare function nw_endpoint_get_url(endpoint: NSObject & OS_nw_endpoint): interop.Pointer | interop.Reference<any>;

declare const enum nw_endpoint_type_t {

	nw_endpoint_type_invalid = 0,

	nw_endpoint_type_address = 1,

	nw_endpoint_type_host = 2,

	nw_endpoint_type_bonjour_service = 3,

	nw_endpoint_type_url = 4
}

/**
 * @since 12.0
 */
declare function nw_error_copy_cf_error(error: NSObject & OS_nw_error): interop.Unmanaged<NSError>;

declare const enum nw_error_domain_t {

	nw_error_domain_invalid = 0,

	nw_error_domain_posix = 1,

	nw_error_domain_dns = 2,

	nw_error_domain_tls = 3,

	nw_error_domain_wifi_aware = 4
}

/**
 * @since 12.0
 */
declare function nw_error_get_error_code(error: NSObject & OS_nw_error): number;

/**
 * @since 12.0
 */
declare function nw_error_get_error_domain(error: NSObject & OS_nw_error): nw_error_domain_t;

/**
 * @since 13.0
 */
declare function nw_establishment_report_copy_proxy_endpoint(report: NSObject & OS_nw_establishment_report): NSObject & OS_nw_endpoint;

/**
 * @since 13.0
 */
declare function nw_establishment_report_enumerate_protocols(report: NSObject & OS_nw_establishment_report, enumerate_block: (p1: NSObject & OS_nw_protocol_definition, p2: number, p3: number) => boolean): void;

/**
 * @since 14.0
 */
declare function nw_establishment_report_enumerate_resolution_reports(report: NSObject & OS_nw_establishment_report, enumerate_block: (p1: NSObject & OS_nw_resolution_report) => boolean): void;

/**
 * @since 13.0
 */
declare function nw_establishment_report_enumerate_resolutions(report: NSObject & OS_nw_establishment_report, enumerate_block: (p1: nw_report_resolution_source_t, p2: number, p3: number, p4: NSObject & OS_nw_endpoint, p5: NSObject & OS_nw_endpoint) => boolean): void;

/**
 * @since 13.0
 */
declare function nw_establishment_report_get_attempt_started_after_milliseconds(report: NSObject & OS_nw_establishment_report): number;

/**
 * @since 13.0
 */
declare function nw_establishment_report_get_duration_milliseconds(report: NSObject & OS_nw_establishment_report): number;

/**
 * @since 13.0
 */
declare function nw_establishment_report_get_previous_attempt_count(report: NSObject & OS_nw_establishment_report): number;

/**
 * @since 13.0
 */
declare function nw_establishment_report_get_proxy_configured(report: NSObject & OS_nw_establishment_report): boolean;

/**
 * @since 13.0
 */
declare function nw_establishment_report_get_used_proxy(report: NSObject & OS_nw_establishment_report): boolean;

declare const enum nw_ethernet_channel_state_t {

	nw_ethernet_channel_state_invalid = 0,

	nw_ethernet_channel_state_waiting = 1,

	nw_ethernet_channel_state_preparing = 2,

	nw_ethernet_channel_state_ready = 3,

	nw_ethernet_channel_state_failed = 4,

	nw_ethernet_channel_state_cancelled = 5
}

/**
 * @since 13.0
 */
declare function nw_framer_async(framer: NSObject & OS_nw_framer, async_block: () => void): void;

/**
 * @since 13.0
 */
declare function nw_framer_copy_local_endpoint(framer: NSObject & OS_nw_framer): NSObject & OS_nw_endpoint;

/**
 * @since 15.4
 */
declare function nw_framer_copy_options(framer: NSObject & OS_nw_framer): NSObject & OS_nw_protocol_options;

/**
 * @since 13.0
 */
declare function nw_framer_copy_parameters(framer: NSObject & OS_nw_framer): NSObject & OS_nw_parameters;

/**
 * @since 13.0
 */
declare function nw_framer_copy_remote_endpoint(framer: NSObject & OS_nw_framer): NSObject & OS_nw_endpoint;

/**
 * @since 13.0
 */
declare function nw_framer_create_definition(identifier: string | interop.Pointer | interop.Reference<any>, flags: number, start_handler: (p1: NSObject & OS_nw_framer) => nw_framer_start_result_t): NSObject & OS_nw_protocol_definition;

/**
 * @since 13.0
 */
declare function nw_framer_create_options(framer_definition: NSObject & OS_nw_protocol_definition): NSObject & OS_nw_protocol_options;

/**
 * @since 13.0
 */
declare function nw_framer_deliver_input(framer: NSObject & OS_nw_framer, input_buffer: string | interop.Pointer | interop.Reference<any>, input_length: number, message: NSObject & OS_nw_protocol_metadata, is_complete: boolean): void;

/**
 * @since 13.0
 */
declare function nw_framer_deliver_input_no_copy(framer: NSObject & OS_nw_framer, input_length: number, message: NSObject & OS_nw_protocol_metadata, is_complete: boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_framer_mark_failed_with_error(framer: NSObject & OS_nw_framer, error_code: number): void;

/**
 * @since 13.0
 */
declare function nw_framer_mark_ready(framer: NSObject & OS_nw_framer): void;

/**
 * @since 13.0
 */
declare function nw_framer_message_access_value(message: NSObject & OS_nw_protocol_metadata, key: string | interop.Pointer | interop.Reference<any>, access_value: (p1: interop.Pointer | interop.Reference<any>) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_framer_message_copy_object_value(message: NSObject & OS_nw_protocol_metadata, key: string | interop.Pointer | interop.Reference<any>): any;

/**
 * @since 13.0
 */
declare function nw_framer_message_create(framer: NSObject & OS_nw_framer): NSObject & OS_nw_protocol_metadata;

/**
 * @since 13.0
 */
declare function nw_framer_message_set_object_value(message: NSObject & OS_nw_protocol_metadata, key: string | interop.Pointer | interop.Reference<any>, value: any): void;

/**
 * @since 13.0
 */
declare function nw_framer_message_set_value(message: NSObject & OS_nw_protocol_metadata, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, dispose_value: (p1: interop.Pointer | interop.Reference<any>) => void): void;

/**
 * @since 15.4
 */
declare function nw_framer_options_copy_object_value(options: NSObject & OS_nw_protocol_options, key: string | interop.Pointer | interop.Reference<any>): any;

/**
 * @since 15.4
 */
declare function nw_framer_options_set_object_value(options: NSObject & OS_nw_protocol_options, key: string | interop.Pointer | interop.Reference<any>, value: any): void;

/**
 * @since 13.0
 */
declare function nw_framer_parse_input(framer: NSObject & OS_nw_framer, minimum_incomplete_length: number, maximum_length: number, temp_buffer: string | interop.Pointer | interop.Reference<any>, parse: (p1: interop.Pointer | interop.Reference<any>, p2: number, p3: boolean) => number): boolean;

/**
 * @since 13.0
 */
declare function nw_framer_parse_output(framer: NSObject & OS_nw_framer, minimum_incomplete_length: number, maximum_length: number, temp_buffer: string | interop.Pointer | interop.Reference<any>, parse: (p1: interop.Pointer | interop.Reference<any>, p2: number, p3: boolean) => number): boolean;

/**
 * @since 13.0
 */
declare function nw_framer_pass_through_input(framer: NSObject & OS_nw_framer): void;

/**
 * @since 13.0
 */
declare function nw_framer_pass_through_output(framer: NSObject & OS_nw_framer): void;

/**
 * @since 13.0
 */
declare function nw_framer_prepend_application_protocol(framer: NSObject & OS_nw_framer, protocol_options: NSObject & OS_nw_protocol_options): boolean;

/**
 * @since 13.0
 */
declare function nw_framer_protocol_create_message(definition: NSObject & OS_nw_protocol_definition): NSObject & OS_nw_protocol_metadata;

/**
 * @since 13.0
 */
declare function nw_framer_schedule_wakeup(framer: NSObject & OS_nw_framer, milliseconds: number): void;

/**
 * @since 13.0
 */
declare function nw_framer_set_cleanup_handler(framer: NSObject & OS_nw_framer, cleanup_handler: (p1: NSObject & OS_nw_framer) => void): void;

/**
 * @since 13.0
 */
declare function nw_framer_set_input_handler(framer: NSObject & OS_nw_framer, input_handler: (p1: NSObject & OS_nw_framer) => number): void;

/**
 * @since 13.0
 */
declare function nw_framer_set_output_handler(framer: NSObject & OS_nw_framer, output_handler: (p1: NSObject & OS_nw_framer, p2: NSObject & OS_nw_protocol_metadata, p3: number, p4: boolean) => void): void;

/**
 * @since 13.0
 */
declare function nw_framer_set_stop_handler(framer: NSObject & OS_nw_framer, stop_handler: (p1: NSObject & OS_nw_framer) => boolean): void;

/**
 * @since 13.0
 */
declare function nw_framer_set_wakeup_handler(framer: NSObject & OS_nw_framer, wakeup_handler: (p1: NSObject & OS_nw_framer) => void): void;

declare const enum nw_framer_start_result_t {

	nw_framer_start_result_ready = 1,

	nw_framer_start_result_will_mark_ready = 2
}

/**
 * @since 13.0
 */
declare function nw_framer_write_output(framer: NSObject & OS_nw_framer, output_buffer: string | interop.Pointer | interop.Reference<any>, output_length: number): void;

/**
 * @since 13.0
 */
declare function nw_framer_write_output_data(framer: NSObject & OS_nw_framer, output_data: NSObject & OS_dispatch_data): void;

/**
 * @since 13.0
 */
declare function nw_framer_write_output_no_copy(framer: NSObject & OS_nw_framer, output_length: number): boolean;

/**
 * @since 14.0
 */
declare function nw_group_descriptor_add_endpoint(descriptor: NSObject & OS_nw_group_descriptor, endpoint: NSObject & OS_nw_endpoint): boolean;

/**
 * @since 14.0
 */
declare function nw_group_descriptor_create_multicast(multicast_group: NSObject & OS_nw_endpoint): NSObject & OS_nw_group_descriptor;

/**
 * @since 15.0
 */
declare function nw_group_descriptor_create_multiplex(remote_endpoint: NSObject & OS_nw_endpoint): NSObject & OS_nw_group_descriptor;

/**
 * @since 14.0
 */
declare function nw_group_descriptor_enumerate_endpoints(descriptor: NSObject & OS_nw_group_descriptor, enumerate_block: (p1: NSObject & OS_nw_endpoint) => boolean): void;

/**
 * @since 12.0
 */
declare function nw_interface_get_index(interface: NSObject & OS_nw_interface): number;

/**
 * @since 12.0
 */
declare function nw_interface_get_name(interface: NSObject & OS_nw_interface): interop.Pointer | interop.Reference<any>;

/**
 * @since 12.0
 */
declare function nw_interface_get_type(interface: NSObject & OS_nw_interface): nw_interface_type_t;

declare const enum nw_interface_radio_type_t {

	nw_interface_radio_type_unknown = 0,

	nw_interface_radio_type_wifi_b = 1,

	nw_interface_radio_type_wifi_a = 2,

	nw_interface_radio_type_wifi_g = 3,

	nw_interface_radio_type_wifi_n = 4,

	nw_interface_radio_type_wifi_ac = 5,

	nw_interface_radio_type_wifi_ax = 6,

	nw_interface_radio_type_cell_lte = 128,

	nw_interface_radio_type_cell_endc_sub6 = 129,

	nw_interface_radio_type_cell_endc_mmw = 130,

	nw_interface_radio_type_cell_nr_sa_sub6 = 131,

	nw_interface_radio_type_cell_nr_sa_mmw = 132,

	nw_interface_radio_type_cell_wcdma = 133,

	nw_interface_radio_type_cell_gsm = 134,

	nw_interface_radio_type_cell_cdma = 135,

	nw_interface_radio_type_cell_evdo = 136
}

declare const enum nw_interface_type_t {

	nw_interface_type_other = 0,

	nw_interface_type_wifi = 1,

	nw_interface_type_cellular = 2,

	nw_interface_type_wired = 3,

	nw_interface_type_loopback = 4
}

/**
 * @since 12.0
 */
declare function nw_ip_create_metadata(): NSObject & OS_nw_protocol_metadata;

declare const enum nw_ip_ecn_flag_t {

	nw_ip_ecn_flag_non_ect = 0,

	nw_ip_ecn_flag_ect_0 = 2,

	nw_ip_ecn_flag_ect_1 = 1,

	nw_ip_ecn_flag_ce = 3
}

declare const enum nw_ip_local_address_preference_t {

	nw_ip_local_address_preference_default = 0,

	nw_ip_local_address_preference_temporary = 1,

	nw_ip_local_address_preference_stable = 2
}

/**
 * @since 12.0
 */
declare function nw_ip_metadata_get_ecn_flag(metadata: NSObject & OS_nw_protocol_metadata): nw_ip_ecn_flag_t;

/**
 * @since 12.0
 */
declare function nw_ip_metadata_get_receive_time(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 12.0
 */
declare function nw_ip_metadata_get_service_class(metadata: NSObject & OS_nw_protocol_metadata): nw_service_class_t;

/**
 * @since 12.0
 */
declare function nw_ip_metadata_set_ecn_flag(metadata: NSObject & OS_nw_protocol_metadata, ecn_flag: nw_ip_ecn_flag_t): void;

/**
 * @since 12.0
 */
declare function nw_ip_metadata_set_service_class(metadata: NSObject & OS_nw_protocol_metadata, service_class: nw_service_class_t): void;

/**
 * @since 12.0
 */
declare function nw_ip_options_set_calculate_receive_time(options: NSObject & OS_nw_protocol_options, calculate_receive_time: boolean): void;

/**
 * @since 12.0
 */
declare function nw_ip_options_set_disable_fragmentation(options: NSObject & OS_nw_protocol_options, disable_fragmentation: boolean): void;

/**
 * @since 14.0
 */
declare function nw_ip_options_set_disable_multicast_loopback(options: NSObject & OS_nw_protocol_options, disable_multicast_loopback: boolean): void;

/**
 * @since 12.0
 */
declare function nw_ip_options_set_hop_limit(options: NSObject & OS_nw_protocol_options, hop_limit: number): void;

/**
 * @since 13.0
 */
declare function nw_ip_options_set_local_address_preference(options: NSObject & OS_nw_protocol_options, preference: nw_ip_local_address_preference_t): void;

/**
 * @since 12.0
 */
declare function nw_ip_options_set_use_minimum_mtu(options: NSObject & OS_nw_protocol_options, use_minimum_mtu: boolean): void;

/**
 * @since 12.0
 */
declare function nw_ip_options_set_version(options: NSObject & OS_nw_protocol_options, version: nw_ip_version_t): void;

declare const enum nw_ip_version_t {

	nw_ip_version_any = 0,

	nw_ip_version_4 = 4,

	nw_ip_version_6 = 6
}

declare const enum nw_link_quality_t {

	nw_link_quality_unknown = 0,

	nw_link_quality_minimal = 10,

	nw_link_quality_moderate = 20,

	nw_link_quality_good = 30
}

/**
 * @since 12.0
 */
declare function nw_listener_cancel(listener: NSObject & OS_nw_listener): void;

/**
 * @since 12.0
 */
declare function nw_listener_create(parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_listener;

/**
 * @since 12.0
 */
declare function nw_listener_create_with_connection(connection: NSObject & OS_nw_connection, parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_listener;

/**
 * @since 12.0
 */
declare function nw_listener_create_with_port(port: string | interop.Pointer | interop.Reference<any>, parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_listener;

/**
 * @since 12.0
 */
declare function nw_listener_get_new_connection_limit(listener: NSObject & OS_nw_listener): number;

/**
 * @since 12.0
 */
declare function nw_listener_get_port(listener: NSObject & OS_nw_listener): number;

/**
 * @since 12.0
 */
declare function nw_listener_set_advertise_descriptor(listener: NSObject & OS_nw_listener, advertise_descriptor: NSObject & OS_nw_advertise_descriptor): void;

/**
 * @since 12.0
 */
declare function nw_listener_set_advertised_endpoint_changed_handler(listener: NSObject & OS_nw_listener, handler: (p1: NSObject & OS_nw_endpoint, p2: boolean) => void): void;

/**
 * @since 15.0
 */
declare function nw_listener_set_new_connection_group_handler(listener: NSObject & OS_nw_listener, handler: (p1: NSObject & OS_nw_connection_group) => void): void;

/**
 * @since 12.0
 */
declare function nw_listener_set_new_connection_handler(listener: NSObject & OS_nw_listener, handler: (p1: NSObject & OS_nw_connection) => void): void;

/**
 * @since 12.0
 */
declare function nw_listener_set_new_connection_limit(listener: NSObject & OS_nw_listener, new_connection_limit: number): void;

/**
 * @since 12.0
 */
declare function nw_listener_set_queue(listener: NSObject & OS_nw_listener, queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 12.0
 */
declare function nw_listener_set_state_changed_handler(listener: NSObject & OS_nw_listener, handler: (p1: nw_listener_state_t, p2: NSObject & OS_nw_error) => void): void;

/**
 * @since 12.0
 */
declare function nw_listener_start(listener: NSObject & OS_nw_listener): void;

declare const enum nw_listener_state_t {

	nw_listener_state_invalid = 0,

	nw_listener_state_waiting = 1,

	nw_listener_state_ready = 2,

	nw_listener_state_failed = 3,

	nw_listener_state_cancelled = 4
}

/**
 * @since 14.0
 */
declare function nw_multicast_group_descriptor_get_disable_unicast_traffic(multicast_descriptor: NSObject & OS_nw_group_descriptor): boolean;

/**
 * @since 14.0
 */
declare function nw_multicast_group_descriptor_set_disable_unicast_traffic(multicast_descriptor: NSObject & OS_nw_group_descriptor, disable_unicast_traffic: boolean): void;

/**
 * @since 14.0
 */
declare function nw_multicast_group_descriptor_set_specific_source(multicast_descriptor: NSObject & OS_nw_group_descriptor, source: NSObject & OS_nw_endpoint): void;

declare const enum nw_multipath_service_t {

	nw_multipath_service_disabled = 0,

	nw_multipath_service_handover = 1,

	nw_multipath_service_interactive = 2,

	nw_multipath_service_aggregate = 3
}

declare const enum nw_multipath_version_t {

	nw_multipath_version_unspecified = -1,

	nw_multipath_version_0 = 0,

	nw_multipath_version_1 = 1
}

declare const enum nw_parameters_attribution_t {

	nw_parameters_attribution_developer = 1,

	nw_parameters_attribution_user = 2
}

/**
 * @since 12.0
 */
declare function nw_parameters_clear_prohibited_interface_types(parameters: NSObject & OS_nw_parameters): void;

/**
 * @since 12.0
 */
declare function nw_parameters_clear_prohibited_interfaces(parameters: NSObject & OS_nw_parameters): void;

/**
 * @since 12.0
 */
declare function nw_parameters_copy(parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_parameters;

/**
 * @since 12.0
 */
declare function nw_parameters_copy_default_protocol_stack(parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_protocol_stack;

/**
 * @since 12.0
 */
declare function nw_parameters_copy_local_endpoint(parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_endpoint;

/**
 * @since 12.0
 */
declare function nw_parameters_copy_required_interface(parameters: NSObject & OS_nw_parameters): NSObject & OS_nw_interface;

/**
 * @since 12.0
 */
declare function nw_parameters_create(): NSObject & OS_nw_parameters;

/**
 * @since 16.0
 */
declare function nw_parameters_create_application_service(): NSObject & OS_nw_parameters;

/**
 * @since 15.0
 */
declare function nw_parameters_create_quic(configure_quic: (p1: NSObject & OS_nw_protocol_options) => void): NSObject & OS_nw_parameters;

/**
 * @since 12.0
 */
declare function nw_parameters_create_secure_tcp(configure_tls: (p1: NSObject & OS_nw_protocol_options) => void, configure_tcp: (p1: NSObject & OS_nw_protocol_options) => void): NSObject & OS_nw_parameters;

/**
 * @since 12.0
 */
declare function nw_parameters_create_secure_udp(configure_dtls: (p1: NSObject & OS_nw_protocol_options) => void, configure_udp: (p1: NSObject & OS_nw_protocol_options) => void): NSObject & OS_nw_parameters;

declare const enum nw_parameters_expired_dns_behavior_t {

	nw_parameters_expired_dns_behavior_default = 0,

	nw_parameters_expired_dns_behavior_allow = 1,

	nw_parameters_expired_dns_behavior_prohibit = 2,

	nw_parameters_expired_dns_behavior_persistent = 3
}

/**
 * @since 26.0
 */
declare function nw_parameters_get_allow_ultra_constrained(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 15.0
 */
declare function nw_parameters_get_attribution(parameters: NSObject & OS_nw_parameters): nw_parameters_attribution_t;

/**
 * @since 12.0
 */
declare function nw_parameters_get_expired_dns_behavior(parameters: NSObject & OS_nw_parameters): nw_parameters_expired_dns_behavior_t;

/**
 * @since 12.0
 */
declare function nw_parameters_get_fast_open_enabled(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 12.0
 */
declare function nw_parameters_get_include_peer_to_peer(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 12.0
 */
declare function nw_parameters_get_local_only(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 12.0
 */
declare function nw_parameters_get_multipath_service(parameters: NSObject & OS_nw_parameters): nw_multipath_service_t;

/**
 * @since 12.0
 */
declare function nw_parameters_get_prefer_no_proxy(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 13.0
 */
declare function nw_parameters_get_prohibit_constrained(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 12.0
 */
declare function nw_parameters_get_prohibit_expensive(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 12.0
 */
declare function nw_parameters_get_required_interface_type(parameters: NSObject & OS_nw_parameters): nw_interface_type_t;

/**
 * @since 12.0
 */
declare function nw_parameters_get_reuse_local_address(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 12.0
 */
declare function nw_parameters_get_service_class(parameters: NSObject & OS_nw_parameters): nw_service_class_t;

/**
 * @since 12.0
 */
declare function nw_parameters_iterate_prohibited_interface_types(parameters: NSObject & OS_nw_parameters, iterate_block: (p1: nw_interface_type_t) => boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_iterate_prohibited_interfaces(parameters: NSObject & OS_nw_parameters, iterate_block: (p1: NSObject & OS_nw_interface) => boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_prohibit_interface(parameters: NSObject & OS_nw_parameters, interface: NSObject & OS_nw_interface): void;

/**
 * @since 12.0
 */
declare function nw_parameters_prohibit_interface_type(parameters: NSObject & OS_nw_parameters, interface_type: nw_interface_type_t): void;

/**
 * @since 12.0
 */
declare function nw_parameters_require_interface(parameters: NSObject & OS_nw_parameters, interface: NSObject & OS_nw_interface): void;

/**
 * @since 16.0
 */
declare function nw_parameters_requires_dnssec_validation(parameters: NSObject & OS_nw_parameters): boolean;

/**
 * @since 26.0
 */
declare function nw_parameters_set_allow_ultra_constrained(parameters: NSObject & OS_nw_parameters, allow_ultra_constrained: boolean): void;

/**
 * @since 15.0
 */
declare function nw_parameters_set_attribution(parameters: NSObject & OS_nw_parameters, attribution: nw_parameters_attribution_t): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_expired_dns_behavior(parameters: NSObject & OS_nw_parameters, expired_dns_behavior: nw_parameters_expired_dns_behavior_t): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_fast_open_enabled(parameters: NSObject & OS_nw_parameters, fast_open_enabled: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_include_peer_to_peer(parameters: NSObject & OS_nw_parameters, include_peer_to_peer: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_local_endpoint(parameters: NSObject & OS_nw_parameters, local_endpoint: NSObject & OS_nw_endpoint): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_local_only(parameters: NSObject & OS_nw_parameters, local_only: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_multipath_service(parameters: NSObject & OS_nw_parameters, multipath_service: nw_multipath_service_t): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_prefer_no_proxy(parameters: NSObject & OS_nw_parameters, prefer_no_proxy: boolean): void;

/**
 * @since 14.0
 */
declare function nw_parameters_set_privacy_context(parameters: NSObject & OS_nw_parameters, privacy_context: NSObject & OS_nw_privacy_context): void;

/**
 * @since 13.0
 */
declare function nw_parameters_set_prohibit_constrained(parameters: NSObject & OS_nw_parameters, prohibit_constrained: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_prohibit_expensive(parameters: NSObject & OS_nw_parameters, prohibit_expensive: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_required_interface_type(parameters: NSObject & OS_nw_parameters, interface_type: nw_interface_type_t): void;

/**
 * @since 16.0
 */
declare function nw_parameters_set_requires_dnssec_validation(parameters: NSObject & OS_nw_parameters, requires_dnssec_validation: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_reuse_local_address(parameters: NSObject & OS_nw_parameters, reuse_local_address: boolean): void;

/**
 * @since 12.0
 */
declare function nw_parameters_set_service_class(parameters: NSObject & OS_nw_parameters, service_class: nw_service_class_t): void;

/**
 * @since 12.0
 */
declare function nw_path_copy_effective_local_endpoint(path: NSObject & OS_nw_path): NSObject & OS_nw_endpoint;

/**
 * @since 12.0
 */
declare function nw_path_copy_effective_remote_endpoint(path: NSObject & OS_nw_path): NSObject & OS_nw_endpoint;

/**
 * @since 13.0
 */
declare function nw_path_enumerate_gateways(path: NSObject & OS_nw_path, enumerate_block: (p1: NSObject & OS_nw_endpoint) => boolean): void;

/**
 * @since 12.0
 */
declare function nw_path_enumerate_interfaces(path: NSObject & OS_nw_path, enumerate_block: (p1: NSObject & OS_nw_interface) => boolean): void;

/**
 * @since 26.0
 */
declare function nw_path_get_link_quality(path: NSObject & OS_nw_path): nw_link_quality_t;

/**
 * @since 12.0
 */
declare function nw_path_get_status(path: NSObject & OS_nw_path): nw_path_status_t;

/**
 * @since 14.2
 */
declare function nw_path_get_unsatisfied_reason(path: NSObject & OS_nw_path): nw_path_unsatisfied_reason_t;

/**
 * @since 12.0
 */
declare function nw_path_has_dns(path: NSObject & OS_nw_path): boolean;

/**
 * @since 12.0
 */
declare function nw_path_has_ipv4(path: NSObject & OS_nw_path): boolean;

/**
 * @since 12.0
 */
declare function nw_path_has_ipv6(path: NSObject & OS_nw_path): boolean;

/**
 * @since 13.0
 */
declare function nw_path_is_constrained(path: NSObject & OS_nw_path): boolean;

/**
 * @since 12.0
 */
declare function nw_path_is_equal(path: NSObject & OS_nw_path, other_path: NSObject & OS_nw_path): boolean;

/**
 * @since 12.0
 */
declare function nw_path_is_expensive(path: NSObject & OS_nw_path): boolean;

/**
 * @since 26.0
 */
declare function nw_path_is_ultra_constrained(path: NSObject & OS_nw_path): boolean;

/**
 * @since 12.0
 */
declare function nw_path_monitor_cancel(monitor: NSObject & OS_nw_path_monitor): void;

/**
 * @since 12.0
 */
declare function nw_path_monitor_create(): NSObject & OS_nw_path_monitor;

/**
 * @since 12.0
 */
declare function nw_path_monitor_create_with_type(required_interface_type: nw_interface_type_t): NSObject & OS_nw_path_monitor;

/**
 * @since 14.0
 */
declare function nw_path_monitor_prohibit_interface_type(monitor: NSObject & OS_nw_path_monitor, interface_type: nw_interface_type_t): void;

/**
 * @since 12.0
 */
declare function nw_path_monitor_set_cancel_handler(monitor: NSObject & OS_nw_path_monitor, cancel_handler: () => void): void;

/**
 * @since 12.0
 */
declare function nw_path_monitor_set_queue(monitor: NSObject & OS_nw_path_monitor, queue: NSObject & OS_dispatch_queue): void;

/**
 * @since 12.0
 */
declare function nw_path_monitor_set_update_handler(monitor: NSObject & OS_nw_path_monitor, update_handler: (p1: NSObject & OS_nw_path) => void): void;

/**
 * @since 12.0
 */
declare function nw_path_monitor_start(monitor: NSObject & OS_nw_path_monitor): void;

declare const enum nw_path_status_t {

	nw_path_status_invalid = 0,

	nw_path_status_satisfied = 1,

	nw_path_status_unsatisfied = 2,

	nw_path_status_satisfiable = 3
}

declare const enum nw_path_unsatisfied_reason_t {

	nw_path_unsatisfied_reason_not_available = 0,

	nw_path_unsatisfied_reason_cellular_denied = 1,

	nw_path_unsatisfied_reason_wifi_denied = 2,

	nw_path_unsatisfied_reason_local_network_denied = 3,

	nw_path_unsatisfied_reason_vpn_inactive = 4
}

/**
 * @since 12.0
 */
declare function nw_path_uses_interface_type(path: NSObject & OS_nw_path, interface_type: nw_interface_type_t): boolean;

/**
 * @since 17.0
 */
declare function nw_privacy_context_add_proxy(privacy_context: NSObject & OS_nw_privacy_context, proxy_config: NSObject & OS_nw_proxy_config): void;

/**
 * @since 17.0
 */
declare function nw_privacy_context_clear_proxies(privacy_context: NSObject & OS_nw_privacy_context): void;

/**
 * @since 14.0
 */
declare function nw_privacy_context_create(description: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_privacy_context;

/**
 * @since 14.0
 */
declare function nw_privacy_context_disable_logging(privacy_context: NSObject & OS_nw_privacy_context): void;

/**
 * @since 14.0
 */
declare function nw_privacy_context_flush_cache(privacy_context: NSObject & OS_nw_privacy_context): void;

/**
 * @since 14.0
 */
declare function nw_privacy_context_require_encrypted_name_resolution(privacy_context: NSObject & OS_nw_privacy_context, require_encrypted_name_resolution: boolean, fallback_resolver_config: NSObject & OS_nw_resolver_config): void;

/**
 * @since 12.0
 */
declare function nw_protocol_copy_ip_definition(): NSObject & OS_nw_protocol_definition;

/**
 * @since 15.0
 */
declare function nw_protocol_copy_quic_definition(): NSObject & OS_nw_protocol_definition;

/**
 * @since 12.0
 */
declare function nw_protocol_copy_tcp_definition(): NSObject & OS_nw_protocol_definition;

/**
 * @since 12.0
 */
declare function nw_protocol_copy_tls_definition(): NSObject & OS_nw_protocol_definition;

/**
 * @since 12.0
 */
declare function nw_protocol_copy_udp_definition(): NSObject & OS_nw_protocol_definition;

/**
 * @since 13.0
 */
declare function nw_protocol_copy_ws_definition(): NSObject & OS_nw_protocol_definition;

/**
 * @since 12.0
 */
declare function nw_protocol_definition_is_equal(definition1: NSObject & OS_nw_protocol_definition, definition2: NSObject & OS_nw_protocol_definition): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_metadata_copy_definition(metadata: NSObject & OS_nw_protocol_metadata): NSObject & OS_nw_protocol_definition;

/**
 * @since 13.0
 */
declare function nw_protocol_metadata_is_framer_message(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_metadata_is_ip(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 15.0
 */
declare function nw_protocol_metadata_is_quic(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_metadata_is_tcp(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_metadata_is_tls(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_metadata_is_udp(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 13.0
 */
declare function nw_protocol_metadata_is_ws(metadata: NSObject & OS_nw_protocol_metadata): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_options_copy_definition(options: NSObject & OS_nw_protocol_options): NSObject & OS_nw_protocol_definition;

/**
 * @since 15.0
 */
declare function nw_protocol_options_is_quic(options: NSObject & OS_nw_protocol_options): boolean;

/**
 * @since 12.0
 */
declare function nw_protocol_stack_clear_application_protocols(stack: NSObject & OS_nw_protocol_stack): void;

/**
 * @since 12.0
 */
declare function nw_protocol_stack_copy_internet_protocol(stack: NSObject & OS_nw_protocol_stack): NSObject & OS_nw_protocol_options;

/**
 * @since 12.0
 */
declare function nw_protocol_stack_copy_transport_protocol(stack: NSObject & OS_nw_protocol_stack): NSObject & OS_nw_protocol_options;

/**
 * @since 12.0
 */
declare function nw_protocol_stack_iterate_application_protocols(stack: NSObject & OS_nw_protocol_stack, iterate_block: (p1: NSObject & OS_nw_protocol_options) => void): void;

/**
 * @since 12.0
 */
declare function nw_protocol_stack_prepend_application_protocol(stack: NSObject & OS_nw_protocol_stack, protocol: NSObject & OS_nw_protocol_options): void;

/**
 * @since 12.0
 */
declare function nw_protocol_stack_set_transport_protocol(stack: NSObject & OS_nw_protocol_stack, protocol: NSObject & OS_nw_protocol_options): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_add_excluded_domain(config: NSObject & OS_nw_proxy_config, excluded_domain: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_add_match_domain(config: NSObject & OS_nw_proxy_config, match_domain: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_clear_excluded_domains(config: NSObject & OS_nw_proxy_config): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_clear_match_domains(config: NSObject & OS_nw_proxy_config): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_create_http_connect(proxy_endpoint: NSObject & OS_nw_endpoint, proxy_tls_options: NSObject & OS_nw_protocol_options): NSObject & OS_nw_proxy_config;

/**
 * @since 17.0
 */
declare function nw_proxy_config_create_oblivious_http(relay: NSObject & OS_nw_relay_hop, relay_resource_path: string | interop.Pointer | interop.Reference<any>, gateway_key_config: string | interop.Pointer | interop.Reference<any>, gateway_key_config_length: number): NSObject & OS_nw_proxy_config;

/**
 * @since 17.0
 */
declare function nw_proxy_config_create_relay(first_hop: NSObject & OS_nw_relay_hop, second_hop: NSObject & OS_nw_relay_hop): NSObject & OS_nw_proxy_config;

/**
 * @since 17.0
 */
declare function nw_proxy_config_create_socksv5(proxy_endpoint: NSObject & OS_nw_endpoint): NSObject & OS_nw_proxy_config;

/**
 * @since 17.0
 */
declare function nw_proxy_config_enumerate_excluded_domains(config: NSObject & OS_nw_proxy_config, enumerator: (p1: interop.Pointer | interop.Reference<any>) => void): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_enumerate_match_domains(config: NSObject & OS_nw_proxy_config, enumerator: (p1: interop.Pointer | interop.Reference<any>) => void): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_get_failover_allowed(proxy_config: NSObject & OS_nw_proxy_config): boolean;

/**
 * @since 17.0
 */
declare function nw_proxy_config_set_failover_allowed(proxy_config: NSObject & OS_nw_proxy_config, failover_allowed: boolean): void;

/**
 * @since 17.0
 */
declare function nw_proxy_config_set_username_and_password(proxy_config: NSObject & OS_nw_proxy_config, username: string | interop.Pointer | interop.Reference<any>, password: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 15.0
 */
declare function nw_quic_add_tls_application_protocol(options: NSObject & OS_nw_protocol_options, application_protocol: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 15.0
 */
declare function nw_quic_copy_sec_protocol_metadata(metadata: NSObject & OS_nw_protocol_metadata): NSObject & OS_sec_protocol_metadata;

/**
 * @since 15.0
 */
declare function nw_quic_copy_sec_protocol_options(options: NSObject & OS_nw_protocol_options): NSObject & OS_sec_protocol_options;

/**
 * @since 15.0
 */
declare function nw_quic_create_options(): NSObject & OS_nw_protocol_options;

/**
 * @since 15.0
 */
declare function nw_quic_get_application_error(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_application_error_reason(metadata: NSObject & OS_nw_protocol_metadata): interop.Pointer | interop.Reference<any>;

/**
 * @since 15.0
 */
declare function nw_quic_get_idle_timeout(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_initial_max_data(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_initial_max_stream_data_bidirectional_local(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_initial_max_stream_data_bidirectional_remote(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_initial_max_stream_data_unidirectional(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_initial_max_streams_bidirectional(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_initial_max_streams_unidirectional(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_keepalive_interval(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_local_max_streams_bidirectional(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_local_max_streams_unidirectional(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 16.0
 */
declare function nw_quic_get_max_datagram_frame_size(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_max_udp_payload_size(options: NSObject & OS_nw_protocol_options): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_remote_idle_timeout(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_remote_max_streams_bidirectional(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_remote_max_streams_unidirectional(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_stream_application_error(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_get_stream_id(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 16.0
 */
declare function nw_quic_get_stream_is_datagram(options: NSObject & OS_nw_protocol_options): boolean;

/**
 * @since 15.0
 */
declare function nw_quic_get_stream_is_unidirectional(options: NSObject & OS_nw_protocol_options): boolean;

/**
 * @since 15.0
 */
declare function nw_quic_get_stream_type(stream_metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 16.0
 */
declare function nw_quic_get_stream_usable_datagram_frame_size(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 15.0
 */
declare function nw_quic_set_application_error(metadata: NSObject & OS_nw_protocol_metadata, application_error: number, reason: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_idle_timeout(options: NSObject & OS_nw_protocol_options, idle_timeout: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_initial_max_data(options: NSObject & OS_nw_protocol_options, initial_max_data: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_initial_max_stream_data_bidirectional_local(options: NSObject & OS_nw_protocol_options, initial_max_stream_data_bidirectional_local: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_initial_max_stream_data_bidirectional_remote(options: NSObject & OS_nw_protocol_options, initial_max_stream_data_bidirectional_remote: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_initial_max_stream_data_unidirectional(options: NSObject & OS_nw_protocol_options, initial_max_stream_data_unidirectional: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_initial_max_streams_bidirectional(options: NSObject & OS_nw_protocol_options, initial_max_streams_bidirectional: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_initial_max_streams_unidirectional(options: NSObject & OS_nw_protocol_options, initial_max_streams_unidirectional: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_keepalive_interval(metadata: NSObject & OS_nw_protocol_metadata, keepalive_interval: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_local_max_streams_bidirectional(metadata: NSObject & OS_nw_protocol_metadata, max_streams_bidirectional: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_local_max_streams_unidirectional(metadata: NSObject & OS_nw_protocol_metadata, max_streams_unidirectional: number): void;

/**
 * @since 16.0
 */
declare function nw_quic_set_max_datagram_frame_size(options: NSObject & OS_nw_protocol_options, max_datagram_frame_size: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_max_udp_payload_size(options: NSObject & OS_nw_protocol_options, max_udp_payload_size: number): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_stream_application_error(metadata: NSObject & OS_nw_protocol_metadata, application_error: number): void;

/**
 * @since 16.0
 */
declare function nw_quic_set_stream_is_datagram(options: NSObject & OS_nw_protocol_options, is_datagram: boolean): void;

/**
 * @since 15.0
 */
declare function nw_quic_set_stream_is_unidirectional(options: NSObject & OS_nw_protocol_options, is_unidirectional: boolean): void;

declare const enum nw_quic_stream_type_t {

	nw_quic_stream_type_unknown = 0,

	nw_quic_stream_type_bidirectional = 1,

	nw_quic_stream_type_unidirectional = 2,

	nw_quic_stream_type_datagram = 3
}

/**
 * @since 17.0
 */
declare function nw_relay_hop_add_additional_http_header_field(relay_hop: NSObject & OS_nw_relay_hop, field_name: string | interop.Pointer | interop.Reference<any>, field_value: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 17.0
 */
declare function nw_relay_hop_create(http3_relay_endpoint: NSObject & OS_nw_endpoint, http2_relay_endpoint: NSObject & OS_nw_endpoint, relay_tls_options: NSObject & OS_nw_protocol_options): NSObject & OS_nw_relay_hop;

/**
 * @since 12.0
 */
declare function nw_release(obj: interop.Pointer | interop.Reference<any>): void;

declare const enum nw_report_resolution_protocol_t {

	nw_report_resolution_protocol_unknown = 0,

	nw_report_resolution_protocol_udp = 1,

	nw_report_resolution_protocol_tcp = 2,

	nw_report_resolution_protocol_tls = 3,

	nw_report_resolution_protocol_https = 4
}

declare const enum nw_report_resolution_source_t {

	nw_report_resolution_source_query = 1,

	nw_report_resolution_source_cache = 2,

	nw_report_resolution_source_expired_cache = 3
}

/**
 * @since 14.0
 */
declare function nw_resolution_report_copy_preferred_endpoint(resolution_report: NSObject & OS_nw_resolution_report): NSObject & OS_nw_endpoint;

/**
 * @since 14.0
 */
declare function nw_resolution_report_copy_successful_endpoint(resolution_report: NSObject & OS_nw_resolution_report): NSObject & OS_nw_endpoint;

/**
 * @since 14.0
 */
declare function nw_resolution_report_get_endpoint_count(resolution_report: NSObject & OS_nw_resolution_report): number;

/**
 * @since 14.0
 */
declare function nw_resolution_report_get_milliseconds(resolution_report: NSObject & OS_nw_resolution_report): number;

/**
 * @since 14.0
 */
declare function nw_resolution_report_get_protocol(resolution_report: NSObject & OS_nw_resolution_report): nw_report_resolution_protocol_t;

/**
 * @since 14.0
 */
declare function nw_resolution_report_get_source(resolution_report: NSObject & OS_nw_resolution_report): nw_report_resolution_source_t;

/**
 * @since 14.0
 */
declare function nw_resolver_config_add_server_address(config: NSObject & OS_nw_resolver_config, server_address: NSObject & OS_nw_endpoint): void;

/**
 * @since 14.0
 */
declare function nw_resolver_config_create_https(url_endpoint: NSObject & OS_nw_endpoint): NSObject & OS_nw_resolver_config;

/**
 * @since 14.0
 */
declare function nw_resolver_config_create_tls(server_endpoint: NSObject & OS_nw_endpoint): NSObject & OS_nw_resolver_config;

/**
 * @since 12.0
 */
declare function nw_retain(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum nw_service_class_t {

	nw_service_class_best_effort = 0,

	nw_service_class_background = 1,

	nw_service_class_interactive_video = 2,

	nw_service_class_interactive_voice = 3,

	nw_service_class_responsive_data = 4,

	nw_service_class_signaling = 5
}

/**
 * @since 12.0
 */
declare function nw_tcp_create_options(): NSObject & OS_nw_protocol_options;

/**
 * @since 12.0
 */
declare function nw_tcp_get_available_receive_buffer(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 12.0
 */
declare function nw_tcp_get_available_send_buffer(metadata: NSObject & OS_nw_protocol_metadata): number;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_connection_timeout(options: NSObject & OS_nw_protocol_options, connection_timeout: number): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_disable_ack_stretching(options: NSObject & OS_nw_protocol_options, disable_ack_stretching: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_disable_ecn(options: NSObject & OS_nw_protocol_options, disable_ecn: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_enable_fast_open(options: NSObject & OS_nw_protocol_options, enable_fast_open: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_enable_keepalive(options: NSObject & OS_nw_protocol_options, enable_keepalive: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_keepalive_count(options: NSObject & OS_nw_protocol_options, keepalive_count: number): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_keepalive_idle_time(options: NSObject & OS_nw_protocol_options, keepalive_idle_time: number): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_keepalive_interval(options: NSObject & OS_nw_protocol_options, keepalive_interval: number): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_maximum_segment_size(options: NSObject & OS_nw_protocol_options, maximum_segment_size: number): void;

/**
 * @since 15.0
 */
declare function nw_tcp_options_set_multipath_force_version(options: NSObject & OS_nw_protocol_options, multipath_force_version: nw_multipath_version_t): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_no_delay(options: NSObject & OS_nw_protocol_options, no_delay: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_no_options(options: NSObject & OS_nw_protocol_options, no_options: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_no_push(options: NSObject & OS_nw_protocol_options, no_push: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_persist_timeout(options: NSObject & OS_nw_protocol_options, persist_timeout: number): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_retransmit_connection_drop_time(options: NSObject & OS_nw_protocol_options, retransmit_connection_drop_time: number): void;

/**
 * @since 12.0
 */
declare function nw_tcp_options_set_retransmit_fin_drop(options: NSObject & OS_nw_protocol_options, retransmit_fin_drop: boolean): void;

/**
 * @since 12.0
 */
declare function nw_tls_copy_sec_protocol_metadata(metadata: NSObject & OS_nw_protocol_metadata): NSObject & OS_sec_protocol_metadata;

/**
 * @since 12.0
 */
declare function nw_tls_copy_sec_protocol_options(options: NSObject & OS_nw_protocol_options): NSObject & OS_sec_protocol_options;

/**
 * @since 12.0
 */
declare function nw_tls_create_options(): NSObject & OS_nw_protocol_options;

/**
 * @since 13.0
 */
declare function nw_txt_record_access_bytes(txt_record: NSObject & OS_nw_txt_record, access_bytes: (p1: interop.Pointer | interop.Reference<any>, p2: number) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_txt_record_access_key(txt_record: NSObject & OS_nw_txt_record, key: string | interop.Pointer | interop.Reference<any>, access_value: (p1: interop.Pointer | interop.Reference<any>, p2: nw_txt_record_find_key_t, p3: interop.Pointer | interop.Reference<any>, p4: number) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_txt_record_apply(txt_record: NSObject & OS_nw_txt_record, applier: (p1: interop.Pointer | interop.Reference<any>, p2: nw_txt_record_find_key_t, p3: interop.Pointer | interop.Reference<any>, p4: number) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_txt_record_copy(txt_record: NSObject & OS_nw_txt_record): NSObject & OS_nw_txt_record;

/**
 * @since 13.0
 */
declare function nw_txt_record_create_dictionary(): NSObject & OS_nw_txt_record;

/**
 * @since 13.0
 */
declare function nw_txt_record_create_with_bytes(txt_bytes: string | interop.Pointer | interop.Reference<any>, txt_len: number): NSObject & OS_nw_txt_record;

/**
 * @since 13.0
 */
declare function nw_txt_record_find_key(txt_record: NSObject & OS_nw_txt_record, key: string | interop.Pointer | interop.Reference<any>): nw_txt_record_find_key_t;

declare const enum nw_txt_record_find_key_t {

	nw_txt_record_find_key_invalid = 0,

	nw_txt_record_find_key_not_present = 1,

	nw_txt_record_find_key_no_value = 2,

	nw_txt_record_find_key_empty_value = 3,

	nw_txt_record_find_key_non_empty_value = 4
}

/**
 * @since 13.0
 */
declare function nw_txt_record_get_key_count(txt_record: NSObject & OS_nw_txt_record): number;

/**
 * @since 13.0
 */
declare function nw_txt_record_is_dictionary(txt_record: NSObject & OS_nw_txt_record): boolean;

/**
 * @since 13.0
 */
declare function nw_txt_record_is_equal(left: NSObject & OS_nw_txt_record, right: NSObject & OS_nw_txt_record): boolean;

/**
 * @since 13.0
 */
declare function nw_txt_record_remove_key(txt_record: NSObject & OS_nw_txt_record, key: string | interop.Pointer | interop.Reference<any>): boolean;

/**
 * @since 13.0
 */
declare function nw_txt_record_set_key(txt_record: NSObject & OS_nw_txt_record, key: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, value_len: number): boolean;

/**
 * @since 12.0
 */
declare function nw_udp_create_metadata(): NSObject & OS_nw_protocol_metadata;

/**
 * @since 12.0
 */
declare function nw_udp_create_options(): NSObject & OS_nw_protocol_options;

/**
 * @since 12.0
 */
declare function nw_udp_options_set_prefer_no_checksum(options: NSObject & OS_nw_protocol_options, prefer_no_checksum: boolean): void;

declare const enum nw_ws_close_code_t {

	nw_ws_close_code_normal_closure = 1000,

	nw_ws_close_code_going_away = 1001,

	nw_ws_close_code_protocol_error = 1002,

	nw_ws_close_code_unsupported_data = 1003,

	nw_ws_close_code_no_status_received = 1005,

	nw_ws_close_code_abnormal_closure = 1006,

	nw_ws_close_code_invalid_frame_payload_data = 1007,

	nw_ws_close_code_policy_violation = 1008,

	nw_ws_close_code_message_too_big = 1009,

	nw_ws_close_code_mandatory_extension = 1010,

	nw_ws_close_code_internal_server_error = 1011,

	nw_ws_close_code_tls_handshake = 1015
}

/**
 * @since 13.0
 */
declare function nw_ws_create_metadata(opcode: nw_ws_opcode_t): NSObject & OS_nw_protocol_metadata;

/**
 * @since 13.0
 */
declare function nw_ws_create_options(version: nw_ws_version_t): NSObject & OS_nw_protocol_options;

/**
 * @since 13.0
 */
declare function nw_ws_metadata_copy_server_response(metadata: NSObject & OS_nw_protocol_metadata): NSObject & OS_nw_ws_response;

/**
 * @since 13.0
 */
declare function nw_ws_metadata_get_close_code(metadata: NSObject & OS_nw_protocol_metadata): nw_ws_close_code_t;

/**
 * @since 13.0
 */
declare function nw_ws_metadata_get_opcode(metadata: NSObject & OS_nw_protocol_metadata): nw_ws_opcode_t;

/**
 * @since 13.0
 */
declare function nw_ws_metadata_set_close_code(metadata: NSObject & OS_nw_protocol_metadata, close_code: nw_ws_close_code_t): void;

/**
 * @since 13.0
 */
declare function nw_ws_metadata_set_pong_handler(metadata: NSObject & OS_nw_protocol_metadata, client_queue: NSObject & OS_dispatch_queue, pong_handler: (p1: NSObject & OS_nw_error) => void): void;

declare const enum nw_ws_opcode_t {

	nw_ws_opcode_invalid = -1,

	nw_ws_opcode_cont = 0,

	nw_ws_opcode_text = 1,

	nw_ws_opcode_binary = 2,

	nw_ws_opcode_close = 8,

	nw_ws_opcode_ping = 9,

	nw_ws_opcode_pong = 10
}

/**
 * @since 13.0
 */
declare function nw_ws_options_add_additional_header(options: NSObject & OS_nw_protocol_options, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 13.0
 */
declare function nw_ws_options_add_subprotocol(options: NSObject & OS_nw_protocol_options, subprotocol: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 13.0
 */
declare function nw_ws_options_set_auto_reply_ping(options: NSObject & OS_nw_protocol_options, auto_reply_ping: boolean): void;

/**
 * @since 13.0
 */
declare function nw_ws_options_set_client_request_handler(options: NSObject & OS_nw_protocol_options, client_queue: NSObject & OS_dispatch_queue, handler: (p1: NSObject & OS_nw_ws_request) => NSObject & OS_nw_ws_response): void;

/**
 * @since 13.0
 */
declare function nw_ws_options_set_maximum_message_size(options: NSObject & OS_nw_protocol_options, maximum_message_size: number): void;

/**
 * @since 13.0
 */
declare function nw_ws_options_set_skip_handshake(options: NSObject & OS_nw_protocol_options, skip_handshake: boolean): void;

/**
 * @since 13.0
 */
declare function nw_ws_request_enumerate_additional_headers(request: NSObject & OS_nw_ws_request, enumerator: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_ws_request_enumerate_subprotocols(request: NSObject & OS_nw_ws_request, enumerator: (p1: interop.Pointer | interop.Reference<any>) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_ws_response_add_additional_header(response: NSObject & OS_nw_ws_response, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

/**
 * @since 13.0
 */
declare function nw_ws_response_create(status: nw_ws_response_status_t, selected_subprotocol: string | interop.Pointer | interop.Reference<any>): NSObject & OS_nw_ws_response;

/**
 * @since 13.0
 */
declare function nw_ws_response_enumerate_additional_headers(response: NSObject & OS_nw_ws_response, enumerator: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => boolean): boolean;

/**
 * @since 13.0
 */
declare function nw_ws_response_get_selected_subprotocol(response: NSObject & OS_nw_ws_response): interop.Pointer | interop.Reference<any>;

/**
 * @since 13.0
 */
declare function nw_ws_response_get_status(response: NSObject & OS_nw_ws_response): nw_ws_response_status_t;

declare const enum nw_ws_response_status_t {

	nw_ws_response_status_invalid = 0,

	nw_ws_response_status_accept = 1,

	nw_ws_response_status_reject = 2
}

declare const enum nw_ws_version_t {

	nw_ws_version_invalid = 0,

	nw_ws_version_13 = 1
}
