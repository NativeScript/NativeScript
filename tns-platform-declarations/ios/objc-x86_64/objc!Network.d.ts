
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

declare var _nw_connection_send_idempotent_content: (p1: NSObject) => void;

declare var _nw_content_context_default_message: NSObject;

declare var _nw_content_context_default_stream: NSObject;

declare var _nw_content_context_final_send: NSObject;

declare var _nw_data_transfer_report_all_paths: number;

declare var _nw_parameters_configure_protocol_default_configuration: (p1: NSObject) => void;

declare var _nw_parameters_configure_protocol_disable: (p1: NSObject) => void;

declare var kNWErrorDomainDNS: string;

declare var kNWErrorDomainPOSIX: string;

declare var kNWErrorDomainTLS: string;

declare function nw_advertise_descriptor_copy_txt_record_object(advertise_descriptor: NSObject): NSObject;

declare function nw_advertise_descriptor_create_bonjour_service(name: string | interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_advertise_descriptor_get_no_auto_rename(advertise_descriptor: NSObject): boolean;

declare function nw_advertise_descriptor_set_no_auto_rename(advertise_descriptor: NSObject, no_auto_rename: boolean): void;

declare function nw_advertise_descriptor_set_txt_record(advertise_descriptor: NSObject, txt_record: interop.Pointer | interop.Reference<any>, txt_length: number): void;

declare function nw_advertise_descriptor_set_txt_record_object(advertise_descriptor: NSObject, txt_record: NSObject): void;

declare function nw_browse_descriptor_create_bonjour_service(type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_browse_descriptor_get_bonjour_service_domain(descriptor: NSObject): string;

declare function nw_browse_descriptor_get_bonjour_service_type(descriptor: NSObject): string;

declare function nw_browse_descriptor_get_include_txt_record(descriptor: NSObject): boolean;

declare function nw_browse_descriptor_set_include_txt_record(descriptor: NSObject, include_txt_record: boolean): void;

declare const nw_browse_result_change_identical: number;

declare const nw_browse_result_change_interface_added: number;

declare const nw_browse_result_change_interface_removed: number;

declare const nw_browse_result_change_invalid: number;

declare const nw_browse_result_change_result_added: number;

declare const nw_browse_result_change_result_removed: number;

declare const nw_browse_result_change_txt_record_changed: number;

declare function nw_browse_result_copy_endpoint(result: NSObject): NSObject;

declare function nw_browse_result_copy_txt_record_object(result: NSObject): NSObject;

declare function nw_browse_result_enumerate_interfaces(result: NSObject, enumerator: (p1: NSObject) => boolean): void;

declare function nw_browse_result_get_changes(old_result: NSObject, new_result: NSObject): number;

declare function nw_browse_result_get_interfaces_count(result: NSObject): number;

declare function nw_browser_cancel(browser: NSObject): void;

declare function nw_browser_copy_browse_descriptor(browser: NSObject): NSObject;

declare function nw_browser_copy_parameters(browser: NSObject): NSObject;

declare function nw_browser_create(descriptor: NSObject, parameters: NSObject): NSObject;

declare function nw_browser_set_browse_results_changed_handler(browser: NSObject, handler: (p1: NSObject, p2: NSObject, p3: boolean) => void): void;

declare function nw_browser_set_queue(browser: NSObject, queue: NSObject): void;

declare function nw_browser_set_state_changed_handler(browser: NSObject, state_changed_handler: (p1: nw_browser_state_t, p2: NSObject) => void): void;

declare function nw_browser_start(browser: NSObject): void;

declare const enum nw_browser_state_t {

	nw_browser_state_invalid = 0,

	nw_browser_state_ready = 1,

	nw_browser_state_failed = 2,

	nw_browser_state_cancelled = 3
}

declare function nw_connection_access_establishment_report(connection: NSObject, queue: NSObject, access_block: (p1: NSObject) => void): void;

declare function nw_connection_batch(connection: NSObject, batch_block: () => void): void;

declare function nw_connection_cancel(connection: NSObject): void;

declare function nw_connection_cancel_current_endpoint(connection: NSObject): void;

declare function nw_connection_copy_current_path(connection: NSObject): NSObject;

declare function nw_connection_copy_description(connection: NSObject): string;

declare function nw_connection_copy_endpoint(connection: NSObject): NSObject;

declare function nw_connection_copy_parameters(connection: NSObject): NSObject;

declare function nw_connection_copy_protocol_metadata(connection: NSObject, definition: NSObject): NSObject;

declare function nw_connection_create(endpoint: NSObject, parameters: NSObject): NSObject;

declare function nw_connection_create_new_data_transfer_report(connection: NSObject): NSObject;

declare function nw_connection_force_cancel(connection: NSObject): void;

declare function nw_connection_get_maximum_datagram_size(connection: NSObject): number;

declare function nw_connection_receive(connection: NSObject, minimum_incomplete_length: number, maximum_length: number, completion: (p1: NSObject, p2: NSObject, p3: boolean, p4: NSObject) => void): void;

declare function nw_connection_receive_message(connection: NSObject, completion: (p1: NSObject, p2: NSObject, p3: boolean, p4: NSObject) => void): void;

declare function nw_connection_restart(connection: NSObject): void;

declare function nw_connection_send(connection: NSObject, content: NSObject, context: NSObject, is_complete: boolean, completion: (p1: NSObject) => void): void;

declare function nw_connection_set_better_path_available_handler(connection: NSObject, handler: (p1: boolean) => void): void;

declare function nw_connection_set_path_changed_handler(connection: NSObject, handler: (p1: NSObject) => void): void;

declare function nw_connection_set_queue(connection: NSObject, queue: NSObject): void;

declare function nw_connection_set_state_changed_handler(connection: NSObject, handler: (p1: nw_connection_state_t, p2: NSObject) => void): void;

declare function nw_connection_set_viability_changed_handler(connection: NSObject, handler: (p1: boolean) => void): void;

declare function nw_connection_start(connection: NSObject): void;

declare const enum nw_connection_state_t {

	nw_connection_state_invalid = 0,

	nw_connection_state_waiting = 1,

	nw_connection_state_preparing = 2,

	nw_connection_state_ready = 3,

	nw_connection_state_failed = 4,

	nw_connection_state_cancelled = 5
}

declare function nw_content_context_copy_antecedent(context: NSObject): NSObject;

declare function nw_content_context_copy_protocol_metadata(context: NSObject, protocol: NSObject): NSObject;

declare function nw_content_context_create(context_identifier: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_content_context_foreach_protocol_metadata(context: NSObject, foreach_block: (p1: NSObject, p2: NSObject) => void): void;

declare function nw_content_context_get_expiration_milliseconds(context: NSObject): number;

declare function nw_content_context_get_identifier(context: NSObject): string;

declare function nw_content_context_get_is_final(context: NSObject): boolean;

declare function nw_content_context_get_relative_priority(context: NSObject): number;

declare function nw_content_context_set_antecedent(context: NSObject, antecendent_context: NSObject): void;

declare function nw_content_context_set_expiration_milliseconds(context: NSObject, expiration_milliseconds: number): void;

declare function nw_content_context_set_is_final(context: NSObject, is_final: boolean): void;

declare function nw_content_context_set_metadata_for_protocol(context: NSObject, protocol_metadata: NSObject): void;

declare function nw_content_context_set_relative_priority(context: NSObject, relative_priority: number): void;

declare function nw_data_transfer_report_collect(report: NSObject, queue: NSObject, collect_block: (p1: NSObject) => void): void;

declare function nw_data_transfer_report_copy_path_interface(report: NSObject, path_index: number): NSObject;

declare function nw_data_transfer_report_get_duration_milliseconds(report: NSObject): number;

declare function nw_data_transfer_report_get_path_count(report: NSObject): number;

declare function nw_data_transfer_report_get_received_application_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_received_ip_packet_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_received_transport_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_received_transport_duplicate_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_received_transport_out_of_order_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_sent_application_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_sent_ip_packet_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_sent_transport_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_sent_transport_retransmitted_byte_count(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_state(report: NSObject): nw_data_transfer_report_state_t;

declare function nw_data_transfer_report_get_transport_minimum_rtt_milliseconds(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_transport_rtt_variance(report: NSObject, path_index: number): number;

declare function nw_data_transfer_report_get_transport_smoothed_rtt_milliseconds(report: NSObject, path_index: number): number;

declare const enum nw_data_transfer_report_state_t {

	nw_data_transfer_report_state_collecting = 1,

	nw_data_transfer_report_state_collected = 2
}

declare function nw_endpoint_copy_address_string(endpoint: NSObject): string;

declare function nw_endpoint_copy_port_string(endpoint: NSObject): string;

declare function nw_endpoint_create_address(address: interop.Pointer | interop.Reference<sockaddr>): NSObject;

declare function nw_endpoint_create_bonjour_service(name: string | interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_endpoint_create_host(hostname: string | interop.Pointer | interop.Reference<any>, port: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_endpoint_create_url(url: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_endpoint_get_address(endpoint: NSObject): interop.Pointer | interop.Reference<sockaddr>;

declare function nw_endpoint_get_bonjour_service_domain(endpoint: NSObject): string;

declare function nw_endpoint_get_bonjour_service_name(endpoint: NSObject): string;

declare function nw_endpoint_get_bonjour_service_type(endpoint: NSObject): string;

declare function nw_endpoint_get_hostname(endpoint: NSObject): string;

declare function nw_endpoint_get_port(endpoint: NSObject): number;

declare function nw_endpoint_get_type(endpoint: NSObject): nw_endpoint_type_t;

declare function nw_endpoint_get_url(endpoint: NSObject): string;

declare const enum nw_endpoint_type_t {

	nw_endpoint_type_invalid = 0,

	nw_endpoint_type_address = 1,

	nw_endpoint_type_host = 2,

	nw_endpoint_type_bonjour_service = 3,

	nw_endpoint_type_url = 4
}

declare function nw_error_copy_cf_error(error: NSObject): interop.Unmanaged<NSError>;

declare const enum nw_error_domain_t {

	nw_error_domain_invalid = 0,

	nw_error_domain_posix = 1,

	nw_error_domain_dns = 2,

	nw_error_domain_tls = 3
}

declare function nw_error_get_error_code(error: NSObject): number;

declare function nw_error_get_error_domain(error: NSObject): nw_error_domain_t;

declare function nw_establishment_report_copy_proxy_endpoint(report: NSObject): NSObject;

declare function nw_establishment_report_enumerate_protocols(report: NSObject, enumerate_block: (p1: NSObject, p2: number, p3: number) => boolean): void;

declare function nw_establishment_report_enumerate_resolutions(report: NSObject, enumerate_block: (p1: nw_report_resolution_source_t, p2: number, p3: number, p4: NSObject, p5: NSObject) => boolean): void;

declare function nw_establishment_report_get_attempt_started_after_milliseconds(report: NSObject): number;

declare function nw_establishment_report_get_duration_milliseconds(report: NSObject): number;

declare function nw_establishment_report_get_previous_attempt_count(report: NSObject): number;

declare function nw_establishment_report_get_proxy_configured(report: NSObject): boolean;

declare function nw_establishment_report_get_used_proxy(report: NSObject): boolean;

declare const enum nw_ethernet_channel_state_t {

	nw_ethernet_channel_state_invalid = 0,

	nw_ethernet_channel_state_waiting = 1,

	nw_ethernet_channel_state_preparing = 2,

	nw_ethernet_channel_state_ready = 3,

	nw_ethernet_channel_state_failed = 4,

	nw_ethernet_channel_state_cancelled = 5
}

declare function nw_framer_async(framer: NSObject, async_block: () => void): void;

declare function nw_framer_copy_local_endpoint(framer: NSObject): NSObject;

declare function nw_framer_copy_parameters(framer: NSObject): NSObject;

declare function nw_framer_copy_remote_endpoint(framer: NSObject): NSObject;

declare function nw_framer_create_definition(identifier: string | interop.Pointer | interop.Reference<any>, flags: number, start_handler: (p1: NSObject) => nw_framer_start_result_t): NSObject;

declare function nw_framer_create_options(framer_definition: NSObject): NSObject;

declare function nw_framer_deliver_input(framer: NSObject, input_buffer: string | interop.Pointer | interop.Reference<any>, input_length: number, message: NSObject, is_complete: boolean): void;

declare function nw_framer_deliver_input_no_copy(framer: NSObject, input_length: number, message: NSObject, is_complete: boolean): boolean;

declare function nw_framer_mark_failed_with_error(framer: NSObject, error_code: number): void;

declare function nw_framer_mark_ready(framer: NSObject): void;

declare function nw_framer_message_access_value(message: NSObject, key: string | interop.Pointer | interop.Reference<any>, access_value: (p1: interop.Pointer | interop.Reference<any>) => boolean): boolean;

declare function nw_framer_message_copy_object_value(message: NSObject, key: string | interop.Pointer | interop.Reference<any>): any;

declare function nw_framer_message_create(framer: NSObject): NSObject;

declare function nw_framer_message_set_object_value(message: NSObject, key: string | interop.Pointer | interop.Reference<any>, value: any): void;

declare function nw_framer_message_set_value(message: NSObject, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, dispose_value: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_framer_parse_input(framer: NSObject, minimum_incomplete_length: number, maximum_length: number, temp_buffer: string | interop.Pointer | interop.Reference<any>, parse: (p1: string, p2: number, p3: boolean) => number): boolean;

declare function nw_framer_parse_output(framer: NSObject, minimum_incomplete_length: number, maximum_length: number, temp_buffer: string | interop.Pointer | interop.Reference<any>, parse: (p1: string, p2: number, p3: boolean) => number): boolean;

declare function nw_framer_pass_through_input(framer: NSObject): void;

declare function nw_framer_pass_through_output(framer: NSObject): void;

declare function nw_framer_prepend_application_protocol(framer: NSObject, protocol_options: NSObject): boolean;

declare function nw_framer_protocol_create_message(definition: NSObject): NSObject;

declare function nw_framer_schedule_wakeup(framer: NSObject, milliseconds: number): void;

declare function nw_framer_set_cleanup_handler(framer: NSObject, cleanup_handler: (p1: NSObject) => void): void;

declare function nw_framer_set_input_handler(framer: NSObject, input_handler: (p1: NSObject) => number): void;

declare function nw_framer_set_output_handler(framer: NSObject, output_handler: (p1: NSObject, p2: NSObject, p3: number, p4: boolean) => void): void;

declare function nw_framer_set_stop_handler(framer: NSObject, stop_handler: (p1: NSObject) => boolean): void;

declare function nw_framer_set_wakeup_handler(framer: NSObject, wakeup_handler: (p1: NSObject) => void): void;

declare const enum nw_framer_start_result_t {

	nw_framer_start_result_ready = 1,

	nw_framer_start_result_will_mark_ready = 2
}

declare function nw_framer_write_output(framer: NSObject, output_buffer: string | interop.Pointer | interop.Reference<any>, output_length: number): void;

declare function nw_framer_write_output_data(framer: NSObject, output_data: NSObject): void;

declare function nw_framer_write_output_no_copy(framer: NSObject, output_length: number): boolean;

declare function nw_interface_get_index(interface: NSObject): number;

declare function nw_interface_get_name(interface: NSObject): string;

declare function nw_interface_get_type(interface: NSObject): nw_interface_type_t;

declare const enum nw_interface_type_t {

	nw_interface_type_other = 0,

	nw_interface_type_wifi = 1,

	nw_interface_type_cellular = 2,

	nw_interface_type_wired = 3,

	nw_interface_type_loopback = 4
}

declare function nw_ip_create_metadata(): NSObject;

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

declare function nw_ip_metadata_get_ecn_flag(metadata: NSObject): nw_ip_ecn_flag_t;

declare function nw_ip_metadata_get_receive_time(metadata: NSObject): number;

declare function nw_ip_metadata_get_service_class(metadata: NSObject): nw_service_class_t;

declare function nw_ip_metadata_set_ecn_flag(metadata: NSObject, ecn_flag: nw_ip_ecn_flag_t): void;

declare function nw_ip_metadata_set_service_class(metadata: NSObject, service_class: nw_service_class_t): void;

declare function nw_ip_options_set_calculate_receive_time(options: NSObject, calculate_receive_time: boolean): void;

declare function nw_ip_options_set_disable_fragmentation(options: NSObject, disable_fragmentation: boolean): void;

declare function nw_ip_options_set_hop_limit(options: NSObject, hop_limit: number): void;

declare function nw_ip_options_set_local_address_preference(options: NSObject, preference: nw_ip_local_address_preference_t): void;

declare function nw_ip_options_set_use_minimum_mtu(options: NSObject, use_minimum_mtu: boolean): void;

declare function nw_ip_options_set_version(options: NSObject, version: nw_ip_version_t): void;

declare const enum nw_ip_version_t {

	nw_ip_version_any = 0,

	nw_ip_version_4 = 4,

	nw_ip_version_6 = 6
}

declare function nw_listener_cancel(listener: NSObject): void;

declare function nw_listener_create(parameters: NSObject): NSObject;

declare function nw_listener_create_with_connection(connection: NSObject, parameters: NSObject): NSObject;

declare function nw_listener_create_with_port(port: string | interop.Pointer | interop.Reference<any>, parameters: NSObject): NSObject;

declare function nw_listener_get_new_connection_limit(listener: NSObject): number;

declare function nw_listener_get_port(listener: NSObject): number;

declare function nw_listener_set_advertise_descriptor(listener: NSObject, advertise_descriptor: NSObject): void;

declare function nw_listener_set_advertised_endpoint_changed_handler(listener: NSObject, handler: (p1: NSObject, p2: boolean) => void): void;

declare function nw_listener_set_new_connection_handler(listener: NSObject, handler: (p1: NSObject) => void): void;

declare function nw_listener_set_new_connection_limit(listener: NSObject, new_connection_limit: number): void;

declare function nw_listener_set_queue(listener: NSObject, queue: NSObject): void;

declare function nw_listener_set_state_changed_handler(listener: NSObject, handler: (p1: nw_listener_state_t, p2: NSObject) => void): void;

declare function nw_listener_start(listener: NSObject): void;

declare const enum nw_listener_state_t {

	nw_listener_state_invalid = 0,

	nw_listener_state_waiting = 1,

	nw_listener_state_ready = 2,

	nw_listener_state_failed = 3,

	nw_listener_state_cancelled = 4
}

declare const enum nw_multipath_service_t {

	nw_multipath_service_disabled = 0,

	nw_multipath_service_handover = 1,

	nw_multipath_service_interactive = 2,

	nw_multipath_service_aggregate = 3
}

declare function nw_parameters_clear_prohibited_interface_types(parameters: NSObject): void;

declare function nw_parameters_clear_prohibited_interfaces(parameters: NSObject): void;

declare function nw_parameters_copy(parameters: NSObject): NSObject;

declare function nw_parameters_copy_default_protocol_stack(parameters: NSObject): NSObject;

declare function nw_parameters_copy_local_endpoint(parameters: NSObject): NSObject;

declare function nw_parameters_copy_required_interface(parameters: NSObject): NSObject;

declare function nw_parameters_create(): NSObject;

declare function nw_parameters_create_secure_tcp(configure_tls: (p1: NSObject) => void, configure_tcp: (p1: NSObject) => void): NSObject;

declare function nw_parameters_create_secure_udp(configure_dtls: (p1: NSObject) => void, configure_udp: (p1: NSObject) => void): NSObject;

declare const enum nw_parameters_expired_dns_behavior_t {

	nw_parameters_expired_dns_behavior_default = 0,

	nw_parameters_expired_dns_behavior_allow = 1,

	nw_parameters_expired_dns_behavior_prohibit = 2
}

declare function nw_parameters_get_expired_dns_behavior(parameters: NSObject): nw_parameters_expired_dns_behavior_t;

declare function nw_parameters_get_fast_open_enabled(parameters: NSObject): boolean;

declare function nw_parameters_get_include_peer_to_peer(parameters: NSObject): boolean;

declare function nw_parameters_get_local_only(parameters: NSObject): boolean;

declare function nw_parameters_get_multipath_service(parameters: NSObject): nw_multipath_service_t;

declare function nw_parameters_get_prefer_no_proxy(parameters: NSObject): boolean;

declare function nw_parameters_get_prohibit_constrained(parameters: NSObject): boolean;

declare function nw_parameters_get_prohibit_expensive(parameters: NSObject): boolean;

declare function nw_parameters_get_required_interface_type(parameters: NSObject): nw_interface_type_t;

declare function nw_parameters_get_reuse_local_address(parameters: NSObject): boolean;

declare function nw_parameters_get_service_class(parameters: NSObject): nw_service_class_t;

declare function nw_parameters_iterate_prohibited_interface_types(parameters: NSObject, iterate_block: (p1: nw_interface_type_t) => boolean): void;

declare function nw_parameters_iterate_prohibited_interfaces(parameters: NSObject, iterate_block: (p1: NSObject) => boolean): void;

declare function nw_parameters_prohibit_interface(parameters: NSObject, interface: NSObject): void;

declare function nw_parameters_prohibit_interface_type(parameters: NSObject, interface_type: nw_interface_type_t): void;

declare function nw_parameters_require_interface(parameters: NSObject, interface: NSObject): void;

declare function nw_parameters_set_expired_dns_behavior(parameters: NSObject, expired_dns_behavior: nw_parameters_expired_dns_behavior_t): void;

declare function nw_parameters_set_fast_open_enabled(parameters: NSObject, fast_open_enabled: boolean): void;

declare function nw_parameters_set_include_peer_to_peer(parameters: NSObject, include_peer_to_peer: boolean): void;

declare function nw_parameters_set_local_endpoint(parameters: NSObject, local_endpoint: NSObject): void;

declare function nw_parameters_set_local_only(parameters: NSObject, local_only: boolean): void;

declare function nw_parameters_set_multipath_service(parameters: NSObject, multipath_service: nw_multipath_service_t): void;

declare function nw_parameters_set_prefer_no_proxy(parameters: NSObject, prefer_no_proxy: boolean): void;

declare function nw_parameters_set_prohibit_constrained(parameters: NSObject, prohibit_constrained: boolean): void;

declare function nw_parameters_set_prohibit_expensive(parameters: NSObject, prohibit_expensive: boolean): void;

declare function nw_parameters_set_required_interface_type(parameters: NSObject, interface_type: nw_interface_type_t): void;

declare function nw_parameters_set_reuse_local_address(parameters: NSObject, reuse_local_address: boolean): void;

declare function nw_parameters_set_service_class(parameters: NSObject, service_class: nw_service_class_t): void;

declare function nw_path_copy_effective_local_endpoint(path: NSObject): NSObject;

declare function nw_path_copy_effective_remote_endpoint(path: NSObject): NSObject;

declare function nw_path_enumerate_gateways(path: NSObject, enumerate_block: (p1: NSObject) => boolean): void;

declare function nw_path_enumerate_interfaces(path: NSObject, enumerate_block: (p1: NSObject) => boolean): void;

declare function nw_path_get_status(path: NSObject): nw_path_status_t;

declare function nw_path_has_dns(path: NSObject): boolean;

declare function nw_path_has_ipv4(path: NSObject): boolean;

declare function nw_path_has_ipv6(path: NSObject): boolean;

declare function nw_path_is_constrained(path: NSObject): boolean;

declare function nw_path_is_equal(path: NSObject, other_path: NSObject): boolean;

declare function nw_path_is_expensive(path: NSObject): boolean;

declare function nw_path_monitor_cancel(monitor: NSObject): void;

declare function nw_path_monitor_create(): NSObject;

declare function nw_path_monitor_create_with_type(required_interface_type: nw_interface_type_t): NSObject;

declare function nw_path_monitor_set_cancel_handler(monitor: NSObject, cancel_handler: () => void): void;

declare function nw_path_monitor_set_queue(monitor: NSObject, queue: NSObject): void;

declare function nw_path_monitor_set_update_handler(monitor: NSObject, update_handler: (p1: NSObject) => void): void;

declare function nw_path_monitor_start(monitor: NSObject): void;

declare const enum nw_path_status_t {

	nw_path_status_invalid = 0,

	nw_path_status_satisfied = 1,

	nw_path_status_unsatisfied = 2,

	nw_path_status_satisfiable = 3
}

declare function nw_path_uses_interface_type(path: NSObject, interface_type: nw_interface_type_t): boolean;

declare function nw_protocol_copy_ip_definition(): NSObject;

declare function nw_protocol_copy_tcp_definition(): NSObject;

declare function nw_protocol_copy_tls_definition(): NSObject;

declare function nw_protocol_copy_udp_definition(): NSObject;

declare function nw_protocol_copy_ws_definition(): NSObject;

declare function nw_protocol_definition_is_equal(definition1: NSObject, definition2: NSObject): boolean;

declare function nw_protocol_metadata_copy_definition(metadata: NSObject): NSObject;

declare function nw_protocol_metadata_is_framer_message(metadata: NSObject): boolean;

declare function nw_protocol_metadata_is_ip(metadata: NSObject): boolean;

declare function nw_protocol_metadata_is_tcp(metadata: NSObject): boolean;

declare function nw_protocol_metadata_is_tls(metadata: NSObject): boolean;

declare function nw_protocol_metadata_is_udp(metadata: NSObject): boolean;

declare function nw_protocol_metadata_is_ws(metadata: NSObject): boolean;

declare function nw_protocol_options_copy_definition(options: NSObject): NSObject;

declare function nw_protocol_stack_clear_application_protocols(stack: NSObject): void;

declare function nw_protocol_stack_copy_internet_protocol(stack: NSObject): NSObject;

declare function nw_protocol_stack_copy_transport_protocol(stack: NSObject): NSObject;

declare function nw_protocol_stack_iterate_application_protocols(stack: NSObject, iterate_block: (p1: NSObject) => void): void;

declare function nw_protocol_stack_prepend_application_protocol(stack: NSObject, protocol: NSObject): void;

declare function nw_protocol_stack_set_transport_protocol(stack: NSObject, protocol: NSObject): void;

declare function nw_release(obj: interop.Pointer | interop.Reference<any>): void;

declare const enum nw_report_resolution_source_t {

	nw_report_resolution_source_query = 1,

	nw_report_resolution_source_cache = 2,

	nw_report_resolution_source_expired_cache = 3
}

declare function nw_retain(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum nw_service_class_t {

	nw_service_class_best_effort = 0,

	nw_service_class_background = 1,

	nw_service_class_interactive_video = 2,

	nw_service_class_interactive_voice = 3,

	nw_service_class_responsive_data = 4,

	nw_service_class_signaling = 5
}

declare function nw_tcp_create_options(): NSObject;

declare function nw_tcp_get_available_receive_buffer(metadata: NSObject): number;

declare function nw_tcp_get_available_send_buffer(metadata: NSObject): number;

declare function nw_tcp_options_set_connection_timeout(options: NSObject, connection_timeout: number): void;

declare function nw_tcp_options_set_disable_ack_stretching(options: NSObject, disable_ack_stretching: boolean): void;

declare function nw_tcp_options_set_disable_ecn(options: NSObject, disable_ecn: boolean): void;

declare function nw_tcp_options_set_enable_fast_open(options: NSObject, enable_fast_open: boolean): void;

declare function nw_tcp_options_set_enable_keepalive(options: NSObject, enable_keepalive: boolean): void;

declare function nw_tcp_options_set_keepalive_count(options: NSObject, keepalive_count: number): void;

declare function nw_tcp_options_set_keepalive_idle_time(options: NSObject, keepalive_idle_time: number): void;

declare function nw_tcp_options_set_keepalive_interval(options: NSObject, keepalive_interval: number): void;

declare function nw_tcp_options_set_maximum_segment_size(options: NSObject, maximum_segment_size: number): void;

declare function nw_tcp_options_set_no_delay(options: NSObject, no_delay: boolean): void;

declare function nw_tcp_options_set_no_options(options: NSObject, no_options: boolean): void;

declare function nw_tcp_options_set_no_push(options: NSObject, no_push: boolean): void;

declare function nw_tcp_options_set_persist_timeout(options: NSObject, persist_timeout: number): void;

declare function nw_tcp_options_set_retransmit_connection_drop_time(options: NSObject, retransmit_connection_drop_time: number): void;

declare function nw_tcp_options_set_retransmit_fin_drop(options: NSObject, retransmit_fin_drop: boolean): void;

declare function nw_tls_copy_sec_protocol_metadata(metadata: NSObject): NSObject;

declare function nw_tls_copy_sec_protocol_options(options: NSObject): NSObject;

declare function nw_tls_create_options(): NSObject;

declare function nw_txt_record_access_bytes(txt_record: NSObject, access_bytes: (p1: string, p2: number) => boolean): boolean;

declare function nw_txt_record_access_key(txt_record: NSObject, key: string | interop.Pointer | interop.Reference<any>, access_value: (p1: string, p2: nw_txt_record_find_key_t, p3: string, p4: number) => boolean): boolean;

declare function nw_txt_record_apply(txt_record: NSObject, applier: (p1: string, p2: nw_txt_record_find_key_t, p3: string, p4: number) => boolean): boolean;

declare function nw_txt_record_copy(txt_record: NSObject): NSObject;

declare function nw_txt_record_create_dictionary(): NSObject;

declare function nw_txt_record_create_with_bytes(txt_bytes: string | interop.Pointer | interop.Reference<any>, txt_len: number): NSObject;

declare function nw_txt_record_find_key(txt_record: NSObject, key: string | interop.Pointer | interop.Reference<any>): nw_txt_record_find_key_t;

declare const enum nw_txt_record_find_key_t {

	nw_txt_record_find_key_invalid = 0,

	nw_txt_record_find_key_not_present = 1,

	nw_txt_record_find_key_no_value = 2,

	nw_txt_record_find_key_empty_value = 3,

	nw_txt_record_find_key_non_empty_value = 4
}

declare function nw_txt_record_get_key_count(txt_record: NSObject): number;

declare function nw_txt_record_is_dictionary(txt_record: NSObject): boolean;

declare function nw_txt_record_is_equal(left: NSObject, right: NSObject): boolean;

declare function nw_txt_record_remove_key(txt_record: NSObject, key: string | interop.Pointer | interop.Reference<any>): boolean;

declare function nw_txt_record_set_key(txt_record: NSObject, key: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, value_len: number): boolean;

declare function nw_udp_create_metadata(): NSObject;

declare function nw_udp_create_options(): NSObject;

declare function nw_udp_options_set_prefer_no_checksum(options: NSObject, prefer_no_checksum: boolean): void;

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

declare function nw_ws_create_metadata(opcode: nw_ws_opcode_t): NSObject;

declare function nw_ws_create_options(version: nw_ws_version_t): NSObject;

declare function nw_ws_metadata_copy_server_response(metadata: NSObject): NSObject;

declare function nw_ws_metadata_get_close_code(metadata: NSObject): nw_ws_close_code_t;

declare function nw_ws_metadata_get_opcode(metadata: NSObject): nw_ws_opcode_t;

declare function nw_ws_metadata_set_close_code(metadata: NSObject, close_code: nw_ws_close_code_t): void;

declare function nw_ws_metadata_set_pong_handler(metadata: NSObject, client_queue: NSObject, pong_handler: (p1: NSObject) => void): void;

declare const enum nw_ws_opcode_t {

	nw_ws_opcode_invalid = -1,

	nw_ws_opcode_cont = 0,

	nw_ws_opcode_text = 1,

	nw_ws_opcode_binary = 2,

	nw_ws_opcode_close = 8,

	nw_ws_opcode_ping = 9,

	nw_ws_opcode_pong = 10
}

declare function nw_ws_options_add_additional_header(options: NSObject, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_options_add_subprotocol(options: NSObject, subprotocol: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_options_set_auto_reply_ping(options: NSObject, auto_reply_ping: boolean): void;

declare function nw_ws_options_set_client_request_handler(options: NSObject, client_queue: NSObject, handler: (p1: NSObject) => NSObject): void;

declare function nw_ws_options_set_maximum_message_size(options: NSObject, maximum_message_size: number): void;

declare function nw_ws_options_set_skip_handshake(options: NSObject, skip_handshake: boolean): void;

declare function nw_ws_request_enumerate_additional_headers(request: NSObject, enumerator: (p1: string, p2: string) => boolean): boolean;

declare function nw_ws_request_enumerate_subprotocols(request: NSObject, enumerator: (p1: string) => boolean): boolean;

declare function nw_ws_response_add_additional_header(response: NSObject, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_response_create(status: nw_ws_response_status_t, selected_subprotocol: string | interop.Pointer | interop.Reference<any>): NSObject;

declare function nw_ws_response_enumerate_additional_headers(response: NSObject, enumerator: (p1: string, p2: string) => boolean): boolean;

declare function nw_ws_response_get_selected_subprotocol(response: NSObject): string;

declare function nw_ws_response_get_status(response: NSObject): nw_ws_response_status_t;

declare const enum nw_ws_response_status_t {

	nw_ws_response_status_invalid = 0,

	nw_ws_response_status_accept = 1,

	nw_ws_response_status_reject = 2
}

declare const enum nw_ws_version_t {

	nw_ws_version_invalid = 0,

	nw_ws_version_13 = 1
}
