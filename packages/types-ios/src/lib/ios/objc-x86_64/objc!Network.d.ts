
declare var _nw_connection_send_idempotent_content: (p1: interop.Pointer | interop.Reference<any>) => void;

declare var _nw_content_context_default_message: interop.Pointer | interop.Reference<any>;

declare var _nw_content_context_default_stream: interop.Pointer | interop.Reference<any>;

declare var _nw_content_context_final_send: interop.Pointer | interop.Reference<any>;

declare var _nw_data_transfer_report_all_paths: number;

declare var _nw_parameters_configure_protocol_default_configuration: (p1: interop.Pointer | interop.Reference<any>) => void;

declare var _nw_parameters_configure_protocol_disable: (p1: interop.Pointer | interop.Reference<any>) => void;

declare var _nw_privacy_context_default_context: interop.Pointer | interop.Reference<any>;

declare var kNWErrorDomainDNS: string;

declare var kNWErrorDomainPOSIX: string;

declare var kNWErrorDomainTLS: string;

declare function nw_advertise_descriptor_copy_txt_record_object(advertise_descriptor: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_advertise_descriptor_create_application_service(application_service_name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_advertise_descriptor_create_bonjour_service(name: string | interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_advertise_descriptor_get_application_service_name(advertise_descriptor: interop.Pointer | interop.Reference<any>): string;

declare function nw_advertise_descriptor_get_no_auto_rename(advertise_descriptor: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_advertise_descriptor_set_no_auto_rename(advertise_descriptor: interop.Pointer | interop.Reference<any>, no_auto_rename: boolean): void;

declare function nw_advertise_descriptor_set_txt_record(advertise_descriptor: interop.Pointer | interop.Reference<any>, txt_record: interop.Pointer | interop.Reference<any>, txt_length: number): void;

declare function nw_advertise_descriptor_set_txt_record_object(advertise_descriptor: interop.Pointer | interop.Reference<any>, txt_record: interop.Pointer | interop.Reference<any>): void;

declare function nw_browse_descriptor_create_application_service(application_service_name: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browse_descriptor_create_bonjour_service(type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browse_descriptor_get_application_service_name(descriptor: interop.Pointer | interop.Reference<any>): string;

declare function nw_browse_descriptor_get_bonjour_service_domain(descriptor: interop.Pointer | interop.Reference<any>): string;

declare function nw_browse_descriptor_get_bonjour_service_type(descriptor: interop.Pointer | interop.Reference<any>): string;

declare function nw_browse_descriptor_get_include_txt_record(descriptor: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_browse_descriptor_set_include_txt_record(descriptor: interop.Pointer | interop.Reference<any>, include_txt_record: boolean): void;

declare const nw_browse_result_change_identical: number;

declare const nw_browse_result_change_interface_added: number;

declare const nw_browse_result_change_interface_removed: number;

declare const nw_browse_result_change_invalid: number;

declare const nw_browse_result_change_result_added: number;

declare const nw_browse_result_change_result_removed: number;

declare const nw_browse_result_change_txt_record_changed: number;

declare function nw_browse_result_copy_endpoint(result: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browse_result_copy_txt_record_object(result: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browse_result_enumerate_interfaces(result: interop.Pointer | interop.Reference<any>, enumerator: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_browse_result_get_changes(old_result: interop.Pointer | interop.Reference<any>, new_result: interop.Pointer | interop.Reference<any>): number;

declare function nw_browse_result_get_interfaces_count(result: interop.Pointer | interop.Reference<any>): number;

declare function nw_browser_cancel(browser: interop.Pointer | interop.Reference<any>): void;

declare function nw_browser_copy_browse_descriptor(browser: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browser_copy_parameters(browser: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browser_create(descriptor: interop.Pointer | interop.Reference<any>, parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_browser_set_browse_results_changed_handler(browser: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: boolean) => void): void;

declare function nw_browser_set_queue(browser: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>): void;

declare function nw_browser_set_state_changed_handler(browser: interop.Pointer | interop.Reference<any>, state_changed_handler: (p1: nw_browser_state_t, p2: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_browser_start(browser: interop.Pointer | interop.Reference<any>): void;

declare const enum nw_browser_state_t {

	nw_browser_state_invalid = 0,

	nw_browser_state_ready = 1,

	nw_browser_state_failed = 2,

	nw_browser_state_cancelled = 3,

	nw_browser_state_waiting = 4
}

declare function nw_connection_access_establishment_report(connection: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, access_block: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_batch(connection: interop.Pointer | interop.Reference<any>, batch_block: () => void): void;

declare function nw_connection_cancel(connection: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_cancel_current_endpoint(connection: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_copy_current_path(connection: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_copy_description(connection: interop.Pointer | interop.Reference<any>): string;

declare function nw_connection_copy_endpoint(connection: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_copy_parameters(connection: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_copy_protocol_metadata(connection: interop.Pointer | interop.Reference<any>, definition: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_create(endpoint: interop.Pointer | interop.Reference<any>, parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_create_new_data_transfer_report(connection: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_force_cancel(connection: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_get_maximum_datagram_size(connection: interop.Pointer | interop.Reference<any>): number;

declare function nw_connection_group_cancel(group: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_group_copy_descriptor(group: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_copy_local_endpoint_for_message(group: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_copy_parameters(group: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_copy_path_for_message(group: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_copy_protocol_metadata(group: interop.Pointer | interop.Reference<any>, definition: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_copy_protocol_metadata_for_message(group: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, definition: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_copy_remote_endpoint_for_message(group: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_create(group_descriptor: interop.Pointer | interop.Reference<any>, parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_extract_connection(group: interop.Pointer | interop.Reference<any>, endpoint: interop.Pointer | interop.Reference<any>, protocol_options: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_extract_connection_for_message(group: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_connection_group_reinsert_extracted_connection(group: interop.Pointer | interop.Reference<any>, connection: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_connection_group_reply(group: interop.Pointer | interop.Reference<any>, inbound_message: interop.Pointer | interop.Reference<any>, outbound_message: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_group_send_message(group: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<any>, endpoint: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, completion: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_group_set_new_connection_handler(group: interop.Pointer | interop.Reference<any>, new_connection_handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_group_set_queue(group: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_group_set_receive_handler(group: interop.Pointer | interop.Reference<any>, maximum_message_size: number, reject_oversized_messages: boolean, receive_handler: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: boolean) => void): void;

declare function nw_connection_group_set_state_changed_handler(group: interop.Pointer | interop.Reference<any>, state_changed_handler: (p1: nw_connection_group_state_t, p2: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_group_start(group: interop.Pointer | interop.Reference<any>): void;

declare const enum nw_connection_group_state_t {

	nw_connection_group_state_invalid = 0,

	nw_connection_group_state_waiting = 1,

	nw_connection_group_state_ready = 2,

	nw_connection_group_state_failed = 3,

	nw_connection_group_state_cancelled = 4
}

declare function nw_connection_receive(connection: interop.Pointer | interop.Reference<any>, minimum_incomplete_length: number, maximum_length: number, completion: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: boolean, p4: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_receive_message(connection: interop.Pointer | interop.Reference<any>, completion: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: boolean, p4: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_restart(connection: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_send(connection: interop.Pointer | interop.Reference<any>, content: interop.Pointer | interop.Reference<any>, context: interop.Pointer | interop.Reference<any>, is_complete: boolean, completion: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_set_better_path_available_handler(connection: interop.Pointer | interop.Reference<any>, handler: (p1: boolean) => void): void;

declare function nw_connection_set_path_changed_handler(connection: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_set_queue(connection: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>): void;

declare function nw_connection_set_state_changed_handler(connection: interop.Pointer | interop.Reference<any>, handler: (p1: nw_connection_state_t, p2: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_connection_set_viability_changed_handler(connection: interop.Pointer | interop.Reference<any>, handler: (p1: boolean) => void): void;

declare function nw_connection_start(connection: interop.Pointer | interop.Reference<any>): void;

declare const enum nw_connection_state_t {

	nw_connection_state_invalid = 0,

	nw_connection_state_waiting = 1,

	nw_connection_state_preparing = 2,

	nw_connection_state_ready = 3,

	nw_connection_state_failed = 4,

	nw_connection_state_cancelled = 5
}

declare function nw_content_context_copy_antecedent(context: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_content_context_copy_protocol_metadata(context: interop.Pointer | interop.Reference<any>, protocol: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_content_context_create(context_identifier: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_content_context_foreach_protocol_metadata(context: interop.Pointer | interop.Reference<any>, foreach_block: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_content_context_get_expiration_milliseconds(context: interop.Pointer | interop.Reference<any>): number;

declare function nw_content_context_get_identifier(context: interop.Pointer | interop.Reference<any>): string;

declare function nw_content_context_get_is_final(context: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_content_context_get_relative_priority(context: interop.Pointer | interop.Reference<any>): number;

declare function nw_content_context_set_antecedent(context: interop.Pointer | interop.Reference<any>, antecedent_context: interop.Pointer | interop.Reference<any>): void;

declare function nw_content_context_set_expiration_milliseconds(context: interop.Pointer | interop.Reference<any>, expiration_milliseconds: number): void;

declare function nw_content_context_set_is_final(context: interop.Pointer | interop.Reference<any>, is_final: boolean): void;

declare function nw_content_context_set_metadata_for_protocol(context: interop.Pointer | interop.Reference<any>, protocol_metadata: interop.Pointer | interop.Reference<any>): void;

declare function nw_content_context_set_relative_priority(context: interop.Pointer | interop.Reference<any>, relative_priority: number): void;

declare function nw_data_transfer_report_collect(report: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>, collect_block: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_data_transfer_report_copy_path_interface(report: interop.Pointer | interop.Reference<any>, path_index: number): interop.Pointer | interop.Reference<any>;

declare function nw_data_transfer_report_get_duration_milliseconds(report: interop.Pointer | interop.Reference<any>): number;

declare function nw_data_transfer_report_get_path_count(report: interop.Pointer | interop.Reference<any>): number;

declare function nw_data_transfer_report_get_path_radio_type(report: interop.Pointer | interop.Reference<any>, path_index: number): nw_interface_radio_type_t;

declare function nw_data_transfer_report_get_received_application_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_received_ip_packet_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_received_transport_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_received_transport_duplicate_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_received_transport_out_of_order_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_sent_application_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_sent_ip_packet_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_sent_transport_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_sent_transport_retransmitted_byte_count(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_state(report: interop.Pointer | interop.Reference<any>): nw_data_transfer_report_state_t;

declare function nw_data_transfer_report_get_transport_minimum_rtt_milliseconds(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_transport_rtt_variance(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare function nw_data_transfer_report_get_transport_smoothed_rtt_milliseconds(report: interop.Pointer | interop.Reference<any>, path_index: number): number;

declare const enum nw_data_transfer_report_state_t {

	nw_data_transfer_report_state_collecting = 1,

	nw_data_transfer_report_state_collected = 2
}

declare function nw_endpoint_copy_address_string(endpoint: interop.Pointer | interop.Reference<any>): string;

declare function nw_endpoint_copy_port_string(endpoint: interop.Pointer | interop.Reference<any>): string;

declare function nw_endpoint_copy_txt_record(endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_endpoint_create_address(address: interop.Pointer | interop.Reference<sockaddr>): interop.Pointer | interop.Reference<any>;

declare function nw_endpoint_create_bonjour_service(name: string | interop.Pointer | interop.Reference<any>, type: string | interop.Pointer | interop.Reference<any>, domain: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_endpoint_create_host(hostname: string | interop.Pointer | interop.Reference<any>, port: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_endpoint_create_url(url: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_endpoint_get_address(endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<sockaddr>;

declare function nw_endpoint_get_bonjour_service_domain(endpoint: interop.Pointer | interop.Reference<any>): string;

declare function nw_endpoint_get_bonjour_service_name(endpoint: interop.Pointer | interop.Reference<any>): string;

declare function nw_endpoint_get_bonjour_service_type(endpoint: interop.Pointer | interop.Reference<any>): string;

declare function nw_endpoint_get_hostname(endpoint: interop.Pointer | interop.Reference<any>): string;

declare function nw_endpoint_get_port(endpoint: interop.Pointer | interop.Reference<any>): number;

declare function nw_endpoint_get_signature(endpoint: interop.Pointer | interop.Reference<any>, out_signature_length: interop.Pointer | interop.Reference<number>): string;

declare function nw_endpoint_get_type(endpoint: interop.Pointer | interop.Reference<any>): nw_endpoint_type_t;

declare function nw_endpoint_get_url(endpoint: interop.Pointer | interop.Reference<any>): string;

declare const enum nw_endpoint_type_t {

	nw_endpoint_type_invalid = 0,

	nw_endpoint_type_address = 1,

	nw_endpoint_type_host = 2,

	nw_endpoint_type_bonjour_service = 3,

	nw_endpoint_type_url = 4
}

declare function nw_error_copy_cf_error(error: interop.Pointer | interop.Reference<any>): interop.Unmanaged<NSError>;

declare const enum nw_error_domain_t {

	nw_error_domain_invalid = 0,

	nw_error_domain_posix = 1,

	nw_error_domain_dns = 2,

	nw_error_domain_tls = 3
}

declare function nw_error_get_error_code(error: interop.Pointer | interop.Reference<any>): number;

declare function nw_error_get_error_domain(error: interop.Pointer | interop.Reference<any>): nw_error_domain_t;

declare function nw_establishment_report_copy_proxy_endpoint(report: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_establishment_report_enumerate_protocols(report: interop.Pointer | interop.Reference<any>, enumerate_block: (p1: interop.Pointer | interop.Reference<any>, p2: number, p3: number) => boolean): void;

declare function nw_establishment_report_enumerate_resolution_reports(report: interop.Pointer | interop.Reference<any>, enumerate_block: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_establishment_report_enumerate_resolutions(report: interop.Pointer | interop.Reference<any>, enumerate_block: (p1: nw_report_resolution_source_t, p2: number, p3: number, p4: interop.Pointer | interop.Reference<any>, p5: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_establishment_report_get_attempt_started_after_milliseconds(report: interop.Pointer | interop.Reference<any>): number;

declare function nw_establishment_report_get_duration_milliseconds(report: interop.Pointer | interop.Reference<any>): number;

declare function nw_establishment_report_get_previous_attempt_count(report: interop.Pointer | interop.Reference<any>): number;

declare function nw_establishment_report_get_proxy_configured(report: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_establishment_report_get_used_proxy(report: interop.Pointer | interop.Reference<any>): boolean;

declare const enum nw_ethernet_channel_state_t {

	nw_ethernet_channel_state_invalid = 0,

	nw_ethernet_channel_state_waiting = 1,

	nw_ethernet_channel_state_preparing = 2,

	nw_ethernet_channel_state_ready = 3,

	nw_ethernet_channel_state_failed = 4,

	nw_ethernet_channel_state_cancelled = 5
}

declare function nw_framer_async(framer: interop.Pointer | interop.Reference<any>, async_block: () => void): void;

declare function nw_framer_copy_local_endpoint(framer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_copy_options(framer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_copy_parameters(framer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_copy_remote_endpoint(framer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_create_definition(identifier: string | interop.Pointer | interop.Reference<any>, flags: number, start_handler: (p1: interop.Pointer | interop.Reference<any>) => nw_framer_start_result_t): interop.Pointer | interop.Reference<any>;

declare function nw_framer_create_options(framer_definition: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_deliver_input(framer: interop.Pointer | interop.Reference<any>, input_buffer: string | interop.Pointer | interop.Reference<any>, input_length: number, message: interop.Pointer | interop.Reference<any>, is_complete: boolean): void;

declare function nw_framer_deliver_input_no_copy(framer: interop.Pointer | interop.Reference<any>, input_length: number, message: interop.Pointer | interop.Reference<any>, is_complete: boolean): boolean;

declare function nw_framer_mark_failed_with_error(framer: interop.Pointer | interop.Reference<any>, error_code: number): void;

declare function nw_framer_mark_ready(framer: interop.Pointer | interop.Reference<any>): void;

declare function nw_framer_message_access_value(message: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, access_value: (p1: interop.Pointer | interop.Reference<any>) => boolean): boolean;

declare function nw_framer_message_copy_object_value(message: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): any;

declare function nw_framer_message_create(framer: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_message_set_object_value(message: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: any): void;

declare function nw_framer_message_set_value(message: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: interop.Pointer | interop.Reference<any>, dispose_value: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_framer_options_copy_object_value(options: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): any;

declare function nw_framer_options_set_object_value(options: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: any): void;

declare function nw_framer_parse_input(framer: interop.Pointer | interop.Reference<any>, minimum_incomplete_length: number, maximum_length: number, temp_buffer: string | interop.Pointer | interop.Reference<any>, parse: (p1: string, p2: number, p3: boolean) => number): boolean;

declare function nw_framer_parse_output(framer: interop.Pointer | interop.Reference<any>, minimum_incomplete_length: number, maximum_length: number, temp_buffer: string | interop.Pointer | interop.Reference<any>, parse: (p1: string, p2: number, p3: boolean) => number): boolean;

declare function nw_framer_pass_through_input(framer: interop.Pointer | interop.Reference<any>): void;

declare function nw_framer_pass_through_output(framer: interop.Pointer | interop.Reference<any>): void;

declare function nw_framer_prepend_application_protocol(framer: interop.Pointer | interop.Reference<any>, protocol_options: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_framer_protocol_create_message(definition: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_framer_schedule_wakeup(framer: interop.Pointer | interop.Reference<any>, milliseconds: number): void;

declare function nw_framer_set_cleanup_handler(framer: interop.Pointer | interop.Reference<any>, cleanup_handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_framer_set_input_handler(framer: interop.Pointer | interop.Reference<any>, input_handler: (p1: interop.Pointer | interop.Reference<any>) => number): void;

declare function nw_framer_set_output_handler(framer: interop.Pointer | interop.Reference<any>, output_handler: (p1: interop.Pointer | interop.Reference<any>, p2: interop.Pointer | interop.Reference<any>, p3: number, p4: boolean) => void): void;

declare function nw_framer_set_stop_handler(framer: interop.Pointer | interop.Reference<any>, stop_handler: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_framer_set_wakeup_handler(framer: interop.Pointer | interop.Reference<any>, wakeup_handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare const enum nw_framer_start_result_t {

	nw_framer_start_result_ready = 1,

	nw_framer_start_result_will_mark_ready = 2
}

declare function nw_framer_write_output(framer: interop.Pointer | interop.Reference<any>, output_buffer: string | interop.Pointer | interop.Reference<any>, output_length: number): void;

declare function nw_framer_write_output_data(framer: interop.Pointer | interop.Reference<any>, output_data: interop.Pointer | interop.Reference<any>): void;

declare function nw_framer_write_output_no_copy(framer: interop.Pointer | interop.Reference<any>, output_length: number): boolean;

declare function nw_group_descriptor_add_endpoint(descriptor: interop.Pointer | interop.Reference<any>, endpoint: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_group_descriptor_create_multicast(multicast_group: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_group_descriptor_create_multiplex(remote_endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_group_descriptor_enumerate_endpoints(descriptor: interop.Pointer | interop.Reference<any>, enumerate_block: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_interface_get_index(interface: interop.Pointer | interop.Reference<any>): number;

declare function nw_interface_get_name(interface: interop.Pointer | interop.Reference<any>): string;

declare function nw_interface_get_type(interface: interop.Pointer | interop.Reference<any>): nw_interface_type_t;

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

declare function nw_ip_create_metadata(): interop.Pointer | interop.Reference<any>;

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

declare function nw_ip_metadata_get_ecn_flag(metadata: interop.Pointer | interop.Reference<any>): nw_ip_ecn_flag_t;

declare function nw_ip_metadata_get_receive_time(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_ip_metadata_get_service_class(metadata: interop.Pointer | interop.Reference<any>): nw_service_class_t;

declare function nw_ip_metadata_set_ecn_flag(metadata: interop.Pointer | interop.Reference<any>, ecn_flag: nw_ip_ecn_flag_t): void;

declare function nw_ip_metadata_set_service_class(metadata: interop.Pointer | interop.Reference<any>, service_class: nw_service_class_t): void;

declare function nw_ip_options_set_calculate_receive_time(options: interop.Pointer | interop.Reference<any>, calculate_receive_time: boolean): void;

declare function nw_ip_options_set_disable_fragmentation(options: interop.Pointer | interop.Reference<any>, disable_fragmentation: boolean): void;

declare function nw_ip_options_set_disable_multicast_loopback(options: interop.Pointer | interop.Reference<any>, disable_multicast_loopback: boolean): void;

declare function nw_ip_options_set_hop_limit(options: interop.Pointer | interop.Reference<any>, hop_limit: number): void;

declare function nw_ip_options_set_local_address_preference(options: interop.Pointer | interop.Reference<any>, preference: nw_ip_local_address_preference_t): void;

declare function nw_ip_options_set_use_minimum_mtu(options: interop.Pointer | interop.Reference<any>, use_minimum_mtu: boolean): void;

declare function nw_ip_options_set_version(options: interop.Pointer | interop.Reference<any>, version: nw_ip_version_t): void;

declare const enum nw_ip_version_t {

	nw_ip_version_any = 0,

	nw_ip_version_4 = 4,

	nw_ip_version_6 = 6
}

declare function nw_listener_cancel(listener: interop.Pointer | interop.Reference<any>): void;

declare function nw_listener_create(parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_listener_create_with_connection(connection: interop.Pointer | interop.Reference<any>, parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_listener_create_with_port(port: string | interop.Pointer | interop.Reference<any>, parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_listener_get_new_connection_limit(listener: interop.Pointer | interop.Reference<any>): number;

declare function nw_listener_get_port(listener: interop.Pointer | interop.Reference<any>): number;

declare function nw_listener_set_advertise_descriptor(listener: interop.Pointer | interop.Reference<any>, advertise_descriptor: interop.Pointer | interop.Reference<any>): void;

declare function nw_listener_set_advertised_endpoint_changed_handler(listener: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>, p2: boolean) => void): void;

declare function nw_listener_set_new_connection_group_handler(listener: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_listener_set_new_connection_handler(listener: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_listener_set_new_connection_limit(listener: interop.Pointer | interop.Reference<any>, new_connection_limit: number): void;

declare function nw_listener_set_queue(listener: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>): void;

declare function nw_listener_set_state_changed_handler(listener: interop.Pointer | interop.Reference<any>, handler: (p1: nw_listener_state_t, p2: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_listener_start(listener: interop.Pointer | interop.Reference<any>): void;

declare const enum nw_listener_state_t {

	nw_listener_state_invalid = 0,

	nw_listener_state_waiting = 1,

	nw_listener_state_ready = 2,

	nw_listener_state_failed = 3,

	nw_listener_state_cancelled = 4
}

declare function nw_multicast_group_descriptor_get_disable_unicast_traffic(multicast_descriptor: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_multicast_group_descriptor_set_disable_unicast_traffic(multicast_descriptor: interop.Pointer | interop.Reference<any>, disable_unicast_traffic: boolean): void;

declare function nw_multicast_group_descriptor_set_specific_source(multicast_descriptor: interop.Pointer | interop.Reference<any>, source: interop.Pointer | interop.Reference<any>): void;

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

declare function nw_parameters_clear_prohibited_interface_types(parameters: interop.Pointer | interop.Reference<any>): void;

declare function nw_parameters_clear_prohibited_interfaces(parameters: interop.Pointer | interop.Reference<any>): void;

declare function nw_parameters_copy(parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_copy_default_protocol_stack(parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_copy_local_endpoint(parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_copy_required_interface(parameters: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_create(): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_create_application_service(): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_create_quic(configure_quic: (p1: interop.Pointer | interop.Reference<any>) => void): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_create_secure_tcp(configure_tls: (p1: interop.Pointer | interop.Reference<any>) => void, configure_tcp: (p1: interop.Pointer | interop.Reference<any>) => void): interop.Pointer | interop.Reference<any>;

declare function nw_parameters_create_secure_udp(configure_dtls: (p1: interop.Pointer | interop.Reference<any>) => void, configure_udp: (p1: interop.Pointer | interop.Reference<any>) => void): interop.Pointer | interop.Reference<any>;

declare const enum nw_parameters_expired_dns_behavior_t {

	nw_parameters_expired_dns_behavior_default = 0,

	nw_parameters_expired_dns_behavior_allow = 1,

	nw_parameters_expired_dns_behavior_prohibit = 2
}

declare function nw_parameters_get_attribution(parameters: interop.Pointer | interop.Reference<any>): nw_parameters_attribution_t;

declare function nw_parameters_get_expired_dns_behavior(parameters: interop.Pointer | interop.Reference<any>): nw_parameters_expired_dns_behavior_t;

declare function nw_parameters_get_fast_open_enabled(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_include_peer_to_peer(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_local_only(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_multipath_service(parameters: interop.Pointer | interop.Reference<any>): nw_multipath_service_t;

declare function nw_parameters_get_prefer_no_proxy(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_prohibit_constrained(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_prohibit_expensive(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_required_interface_type(parameters: interop.Pointer | interop.Reference<any>): nw_interface_type_t;

declare function nw_parameters_get_reuse_local_address(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_get_service_class(parameters: interop.Pointer | interop.Reference<any>): nw_service_class_t;

declare function nw_parameters_iterate_prohibited_interface_types(parameters: interop.Pointer | interop.Reference<any>, iterate_block: (p1: nw_interface_type_t) => boolean): void;

declare function nw_parameters_iterate_prohibited_interfaces(parameters: interop.Pointer | interop.Reference<any>, iterate_block: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_parameters_prohibit_interface(parameters: interop.Pointer | interop.Reference<any>, interface: interop.Pointer | interop.Reference<any>): void;

declare function nw_parameters_prohibit_interface_type(parameters: interop.Pointer | interop.Reference<any>, interface_type: nw_interface_type_t): void;

declare function nw_parameters_require_interface(parameters: interop.Pointer | interop.Reference<any>, interface: interop.Pointer | interop.Reference<any>): void;

declare function nw_parameters_requires_dnssec_validation(parameters: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_parameters_set_attribution(parameters: interop.Pointer | interop.Reference<any>, attribution: nw_parameters_attribution_t): void;

declare function nw_parameters_set_expired_dns_behavior(parameters: interop.Pointer | interop.Reference<any>, expired_dns_behavior: nw_parameters_expired_dns_behavior_t): void;

declare function nw_parameters_set_fast_open_enabled(parameters: interop.Pointer | interop.Reference<any>, fast_open_enabled: boolean): void;

declare function nw_parameters_set_include_peer_to_peer(parameters: interop.Pointer | interop.Reference<any>, include_peer_to_peer: boolean): void;

declare function nw_parameters_set_local_endpoint(parameters: interop.Pointer | interop.Reference<any>, local_endpoint: interop.Pointer | interop.Reference<any>): void;

declare function nw_parameters_set_local_only(parameters: interop.Pointer | interop.Reference<any>, local_only: boolean): void;

declare function nw_parameters_set_multipath_service(parameters: interop.Pointer | interop.Reference<any>, multipath_service: nw_multipath_service_t): void;

declare function nw_parameters_set_prefer_no_proxy(parameters: interop.Pointer | interop.Reference<any>, prefer_no_proxy: boolean): void;

declare function nw_parameters_set_privacy_context(parameters: interop.Pointer | interop.Reference<any>, privacy_context: interop.Pointer | interop.Reference<any>): void;

declare function nw_parameters_set_prohibit_constrained(parameters: interop.Pointer | interop.Reference<any>, prohibit_constrained: boolean): void;

declare function nw_parameters_set_prohibit_expensive(parameters: interop.Pointer | interop.Reference<any>, prohibit_expensive: boolean): void;

declare function nw_parameters_set_required_interface_type(parameters: interop.Pointer | interop.Reference<any>, interface_type: nw_interface_type_t): void;

declare function nw_parameters_set_requires_dnssec_validation(parameters: interop.Pointer | interop.Reference<any>, requires_dnssec_validation: boolean): void;

declare function nw_parameters_set_reuse_local_address(parameters: interop.Pointer | interop.Reference<any>, reuse_local_address: boolean): void;

declare function nw_parameters_set_service_class(parameters: interop.Pointer | interop.Reference<any>, service_class: nw_service_class_t): void;

declare function nw_path_copy_effective_local_endpoint(path: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_path_copy_effective_remote_endpoint(path: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_path_enumerate_gateways(path: interop.Pointer | interop.Reference<any>, enumerate_block: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_path_enumerate_interfaces(path: interop.Pointer | interop.Reference<any>, enumerate_block: (p1: interop.Pointer | interop.Reference<any>) => boolean): void;

declare function nw_path_get_status(path: interop.Pointer | interop.Reference<any>): nw_path_status_t;

declare function nw_path_get_unsatisfied_reason(path: interop.Pointer | interop.Reference<any>): nw_path_unsatisfied_reason_t;

declare function nw_path_has_dns(path: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_path_has_ipv4(path: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_path_has_ipv6(path: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_path_is_constrained(path: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_path_is_equal(path: interop.Pointer | interop.Reference<any>, other_path: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_path_is_expensive(path: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_path_monitor_cancel(monitor: interop.Pointer | interop.Reference<any>): void;

declare function nw_path_monitor_create(): interop.Pointer | interop.Reference<any>;

declare function nw_path_monitor_create_with_type(required_interface_type: nw_interface_type_t): interop.Pointer | interop.Reference<any>;

declare function nw_path_monitor_prohibit_interface_type(monitor: interop.Pointer | interop.Reference<any>, interface_type: nw_interface_type_t): void;

declare function nw_path_monitor_set_cancel_handler(monitor: interop.Pointer | interop.Reference<any>, cancel_handler: () => void): void;

declare function nw_path_monitor_set_queue(monitor: interop.Pointer | interop.Reference<any>, queue: interop.Pointer | interop.Reference<any>): void;

declare function nw_path_monitor_set_update_handler(monitor: interop.Pointer | interop.Reference<any>, update_handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_path_monitor_start(monitor: interop.Pointer | interop.Reference<any>): void;

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

declare function nw_path_uses_interface_type(path: interop.Pointer | interop.Reference<any>, interface_type: nw_interface_type_t): boolean;

declare function nw_privacy_context_add_proxy(privacy_context: interop.Pointer | interop.Reference<any>, proxy_config: interop.Pointer | interop.Reference<any>): void;

declare function nw_privacy_context_clear_proxies(privacy_context: interop.Pointer | interop.Reference<any>): void;

declare function nw_privacy_context_create(description: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_privacy_context_disable_logging(privacy_context: interop.Pointer | interop.Reference<any>): void;

declare function nw_privacy_context_flush_cache(privacy_context: interop.Pointer | interop.Reference<any>): void;

declare function nw_privacy_context_require_encrypted_name_resolution(privacy_context: interop.Pointer | interop.Reference<any>, require_encrypted_name_resolution: boolean, fallback_resolver_config: interop.Pointer | interop.Reference<any>): void;

declare function nw_protocol_copy_ip_definition(): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_copy_quic_definition(): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_copy_tcp_definition(): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_copy_tls_definition(): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_copy_udp_definition(): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_copy_ws_definition(): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_definition_is_equal(definition1: interop.Pointer | interop.Reference<any>, definition2: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_copy_definition(metadata: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_metadata_is_framer_message(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_is_ip(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_is_quic(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_is_tcp(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_is_tls(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_is_udp(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_metadata_is_ws(metadata: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_options_copy_definition(options: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_options_is_quic(options: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_protocol_stack_clear_application_protocols(stack: interop.Pointer | interop.Reference<any>): void;

declare function nw_protocol_stack_copy_internet_protocol(stack: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_stack_copy_transport_protocol(stack: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_protocol_stack_iterate_application_protocols(stack: interop.Pointer | interop.Reference<any>, iterate_block: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare function nw_protocol_stack_prepend_application_protocol(stack: interop.Pointer | interop.Reference<any>, protocol: interop.Pointer | interop.Reference<any>): void;

declare function nw_protocol_stack_set_transport_protocol(stack: interop.Pointer | interop.Reference<any>, protocol: interop.Pointer | interop.Reference<any>): void;

declare function nw_proxy_config_add_excluded_domain(config: interop.Pointer | interop.Reference<any>, excluded_domain: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_proxy_config_add_match_domain(config: interop.Pointer | interop.Reference<any>, match_domain: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_proxy_config_clear_excluded_domains(config: interop.Pointer | interop.Reference<any>): void;

declare function nw_proxy_config_clear_match_domains(config: interop.Pointer | interop.Reference<any>): void;

declare function nw_proxy_config_create_http_connect(proxy_endpoint: interop.Pointer | interop.Reference<any>, proxy_tls_options: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_proxy_config_create_oblivious_http(relay: interop.Pointer | interop.Reference<any>, relay_resource_path: string | interop.Pointer | interop.Reference<any>, gateway_key_config: string | interop.Pointer | interop.Reference<any>, gateway_key_config_length: number): interop.Pointer | interop.Reference<any>;

declare function nw_proxy_config_create_relay(first_hop: interop.Pointer | interop.Reference<any>, second_hop: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_proxy_config_create_socksv5(proxy_endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_proxy_config_enumerate_excluded_domains(config: interop.Pointer | interop.Reference<any>, enumerator: (p1: string) => void): void;

declare function nw_proxy_config_enumerate_match_domains(config: interop.Pointer | interop.Reference<any>, enumerator: (p1: string) => void): void;

declare function nw_proxy_config_get_failover_allowed(proxy_config: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_proxy_config_set_failover_allowed(proxy_config: interop.Pointer | interop.Reference<any>, failover_allowed: boolean): void;

declare function nw_proxy_config_set_username_and_password(proxy_config: interop.Pointer | interop.Reference<any>, username: string | interop.Pointer | interop.Reference<any>, password: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_quic_add_tls_application_protocol(options: interop.Pointer | interop.Reference<any>, application_protocol: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_quic_copy_sec_protocol_metadata(metadata: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_quic_copy_sec_protocol_options(options: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_quic_create_options(): interop.Pointer | interop.Reference<any>;

declare function nw_quic_get_application_error(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_application_error_reason(metadata: interop.Pointer | interop.Reference<any>): string;

declare function nw_quic_get_idle_timeout(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_initial_max_data(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_initial_max_stream_data_bidirectional_local(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_initial_max_stream_data_bidirectional_remote(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_initial_max_stream_data_unidirectional(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_initial_max_streams_bidirectional(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_initial_max_streams_unidirectional(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_keepalive_interval(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_local_max_streams_bidirectional(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_local_max_streams_unidirectional(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_max_datagram_frame_size(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_max_udp_payload_size(options: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_remote_idle_timeout(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_remote_max_streams_bidirectional(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_remote_max_streams_unidirectional(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_stream_application_error(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_stream_id(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_stream_is_datagram(options: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_quic_get_stream_is_unidirectional(options: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_quic_get_stream_type(stream_metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_get_stream_usable_datagram_frame_size(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_quic_set_application_error(metadata: interop.Pointer | interop.Reference<any>, application_error: number, reason: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_quic_set_idle_timeout(options: interop.Pointer | interop.Reference<any>, idle_timeout: number): void;

declare function nw_quic_set_initial_max_data(options: interop.Pointer | interop.Reference<any>, initial_max_data: number): void;

declare function nw_quic_set_initial_max_stream_data_bidirectional_local(options: interop.Pointer | interop.Reference<any>, initial_max_stream_data_bidirectional_local: number): void;

declare function nw_quic_set_initial_max_stream_data_bidirectional_remote(options: interop.Pointer | interop.Reference<any>, initial_max_stream_data_bidirectional_remote: number): void;

declare function nw_quic_set_initial_max_stream_data_unidirectional(options: interop.Pointer | interop.Reference<any>, initial_max_stream_data_unidirectional: number): void;

declare function nw_quic_set_initial_max_streams_bidirectional(options: interop.Pointer | interop.Reference<any>, initial_max_streams_bidirectional: number): void;

declare function nw_quic_set_initial_max_streams_unidirectional(options: interop.Pointer | interop.Reference<any>, initial_max_streams_unidirectional: number): void;

declare function nw_quic_set_keepalive_interval(metadata: interop.Pointer | interop.Reference<any>, keepalive_interval: number): void;

declare function nw_quic_set_local_max_streams_bidirectional(metadata: interop.Pointer | interop.Reference<any>, max_streams_bidirectional: number): void;

declare function nw_quic_set_local_max_streams_unidirectional(metadata: interop.Pointer | interop.Reference<any>, max_streams_unidirectional: number): void;

declare function nw_quic_set_max_datagram_frame_size(options: interop.Pointer | interop.Reference<any>, max_datagram_frame_size: number): void;

declare function nw_quic_set_max_udp_payload_size(options: interop.Pointer | interop.Reference<any>, max_udp_payload_size: number): void;

declare function nw_quic_set_stream_application_error(metadata: interop.Pointer | interop.Reference<any>, application_error: number): void;

declare function nw_quic_set_stream_is_datagram(options: interop.Pointer | interop.Reference<any>, is_datagram: boolean): void;

declare function nw_quic_set_stream_is_unidirectional(options: interop.Pointer | interop.Reference<any>, is_unidirectional: boolean): void;

declare const enum nw_quic_stream_type_t {

	nw_quic_stream_type_unknown = 0,

	nw_quic_stream_type_bidirectional = 1,

	nw_quic_stream_type_unidirectional = 2,

	nw_quic_stream_type_datagram = 3
}

declare function nw_relay_hop_add_additional_http_header_field(relay_hop: interop.Pointer | interop.Reference<any>, field_name: string | interop.Pointer | interop.Reference<any>, field_value: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_relay_hop_create(http3_relay_endpoint: interop.Pointer | interop.Reference<any>, http2_relay_endpoint: interop.Pointer | interop.Reference<any>, relay_tls_options: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

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

declare function nw_resolution_report_copy_preferred_endpoint(resolution_report: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_resolution_report_copy_successful_endpoint(resolution_report: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_resolution_report_get_endpoint_count(resolution_report: interop.Pointer | interop.Reference<any>): number;

declare function nw_resolution_report_get_milliseconds(resolution_report: interop.Pointer | interop.Reference<any>): number;

declare function nw_resolution_report_get_protocol(resolution_report: interop.Pointer | interop.Reference<any>): nw_report_resolution_protocol_t;

declare function nw_resolution_report_get_source(resolution_report: interop.Pointer | interop.Reference<any>): nw_report_resolution_source_t;

declare function nw_resolver_config_add_server_address(config: interop.Pointer | interop.Reference<any>, server_address: interop.Pointer | interop.Reference<any>): void;

declare function nw_resolver_config_create_https(url_endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_resolver_config_create_tls(server_endpoint: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_retain(obj: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare const enum nw_service_class_t {

	nw_service_class_best_effort = 0,

	nw_service_class_background = 1,

	nw_service_class_interactive_video = 2,

	nw_service_class_interactive_voice = 3,

	nw_service_class_responsive_data = 4,

	nw_service_class_signaling = 5
}

declare function nw_tcp_create_options(): interop.Pointer | interop.Reference<any>;

declare function nw_tcp_get_available_receive_buffer(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_tcp_get_available_send_buffer(metadata: interop.Pointer | interop.Reference<any>): number;

declare function nw_tcp_options_set_connection_timeout(options: interop.Pointer | interop.Reference<any>, connection_timeout: number): void;

declare function nw_tcp_options_set_disable_ack_stretching(options: interop.Pointer | interop.Reference<any>, disable_ack_stretching: boolean): void;

declare function nw_tcp_options_set_disable_ecn(options: interop.Pointer | interop.Reference<any>, disable_ecn: boolean): void;

declare function nw_tcp_options_set_enable_fast_open(options: interop.Pointer | interop.Reference<any>, enable_fast_open: boolean): void;

declare function nw_tcp_options_set_enable_keepalive(options: interop.Pointer | interop.Reference<any>, enable_keepalive: boolean): void;

declare function nw_tcp_options_set_keepalive_count(options: interop.Pointer | interop.Reference<any>, keepalive_count: number): void;

declare function nw_tcp_options_set_keepalive_idle_time(options: interop.Pointer | interop.Reference<any>, keepalive_idle_time: number): void;

declare function nw_tcp_options_set_keepalive_interval(options: interop.Pointer | interop.Reference<any>, keepalive_interval: number): void;

declare function nw_tcp_options_set_maximum_segment_size(options: interop.Pointer | interop.Reference<any>, maximum_segment_size: number): void;

declare function nw_tcp_options_set_multipath_force_version(options: interop.Pointer | interop.Reference<any>, multipath_force_version: nw_multipath_version_t): void;

declare function nw_tcp_options_set_no_delay(options: interop.Pointer | interop.Reference<any>, no_delay: boolean): void;

declare function nw_tcp_options_set_no_options(options: interop.Pointer | interop.Reference<any>, no_options: boolean): void;

declare function nw_tcp_options_set_no_push(options: interop.Pointer | interop.Reference<any>, no_push: boolean): void;

declare function nw_tcp_options_set_persist_timeout(options: interop.Pointer | interop.Reference<any>, persist_timeout: number): void;

declare function nw_tcp_options_set_retransmit_connection_drop_time(options: interop.Pointer | interop.Reference<any>, retransmit_connection_drop_time: number): void;

declare function nw_tcp_options_set_retransmit_fin_drop(options: interop.Pointer | interop.Reference<any>, retransmit_fin_drop: boolean): void;

declare function nw_tls_copy_sec_protocol_metadata(metadata: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_tls_copy_sec_protocol_options(options: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_tls_create_options(): interop.Pointer | interop.Reference<any>;

declare function nw_txt_record_access_bytes(txt_record: interop.Pointer | interop.Reference<any>, access_bytes: (p1: string, p2: number) => boolean): boolean;

declare function nw_txt_record_access_key(txt_record: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, access_value: (p1: string, p2: nw_txt_record_find_key_t, p3: string, p4: number) => boolean): boolean;

declare function nw_txt_record_apply(txt_record: interop.Pointer | interop.Reference<any>, applier: (p1: string, p2: nw_txt_record_find_key_t, p3: string, p4: number) => boolean): boolean;

declare function nw_txt_record_copy(txt_record: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_txt_record_create_dictionary(): interop.Pointer | interop.Reference<any>;

declare function nw_txt_record_create_with_bytes(txt_bytes: string | interop.Pointer | interop.Reference<any>, txt_len: number): interop.Pointer | interop.Reference<any>;

declare function nw_txt_record_find_key(txt_record: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): nw_txt_record_find_key_t;

declare const enum nw_txt_record_find_key_t {

	nw_txt_record_find_key_invalid = 0,

	nw_txt_record_find_key_not_present = 1,

	nw_txt_record_find_key_no_value = 2,

	nw_txt_record_find_key_empty_value = 3,

	nw_txt_record_find_key_non_empty_value = 4
}

declare function nw_txt_record_get_key_count(txt_record: interop.Pointer | interop.Reference<any>): number;

declare function nw_txt_record_is_dictionary(txt_record: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_txt_record_is_equal(left: interop.Pointer | interop.Reference<any>, right: interop.Pointer | interop.Reference<any>): boolean;

declare function nw_txt_record_remove_key(txt_record: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>): boolean;

declare function nw_txt_record_set_key(txt_record: interop.Pointer | interop.Reference<any>, key: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>, value_len: number): boolean;

declare function nw_udp_create_metadata(): interop.Pointer | interop.Reference<any>;

declare function nw_udp_create_options(): interop.Pointer | interop.Reference<any>;

declare function nw_udp_options_set_prefer_no_checksum(options: interop.Pointer | interop.Reference<any>, prefer_no_checksum: boolean): void;

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

declare function nw_ws_create_metadata(opcode: nw_ws_opcode_t): interop.Pointer | interop.Reference<any>;

declare function nw_ws_create_options(version: nw_ws_version_t): interop.Pointer | interop.Reference<any>;

declare function nw_ws_metadata_copy_server_response(metadata: interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_ws_metadata_get_close_code(metadata: interop.Pointer | interop.Reference<any>): nw_ws_close_code_t;

declare function nw_ws_metadata_get_opcode(metadata: interop.Pointer | interop.Reference<any>): nw_ws_opcode_t;

declare function nw_ws_metadata_set_close_code(metadata: interop.Pointer | interop.Reference<any>, close_code: nw_ws_close_code_t): void;

declare function nw_ws_metadata_set_pong_handler(metadata: interop.Pointer | interop.Reference<any>, client_queue: interop.Pointer | interop.Reference<any>, pong_handler: (p1: interop.Pointer | interop.Reference<any>) => void): void;

declare const enum nw_ws_opcode_t {

	nw_ws_opcode_invalid = -1,

	nw_ws_opcode_cont = 0,

	nw_ws_opcode_text = 1,

	nw_ws_opcode_binary = 2,

	nw_ws_opcode_close = 8,

	nw_ws_opcode_ping = 9,

	nw_ws_opcode_pong = 10
}

declare function nw_ws_options_add_additional_header(options: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_options_add_subprotocol(options: interop.Pointer | interop.Reference<any>, subprotocol: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_options_set_auto_reply_ping(options: interop.Pointer | interop.Reference<any>, auto_reply_ping: boolean): void;

declare function nw_ws_options_set_client_request_handler(options: interop.Pointer | interop.Reference<any>, client_queue: interop.Pointer | interop.Reference<any>, handler: (p1: interop.Pointer | interop.Reference<any>) => interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_options_set_maximum_message_size(options: interop.Pointer | interop.Reference<any>, maximum_message_size: number): void;

declare function nw_ws_options_set_skip_handshake(options: interop.Pointer | interop.Reference<any>, skip_handshake: boolean): void;

declare function nw_ws_request_enumerate_additional_headers(request: interop.Pointer | interop.Reference<any>, enumerator: (p1: string, p2: string) => boolean): boolean;

declare function nw_ws_request_enumerate_subprotocols(request: interop.Pointer | interop.Reference<any>, enumerator: (p1: string) => boolean): boolean;

declare function nw_ws_response_add_additional_header(response: interop.Pointer | interop.Reference<any>, name: string | interop.Pointer | interop.Reference<any>, value: string | interop.Pointer | interop.Reference<any>): void;

declare function nw_ws_response_create(status: nw_ws_response_status_t, selected_subprotocol: string | interop.Pointer | interop.Reference<any>): interop.Pointer | interop.Reference<any>;

declare function nw_ws_response_enumerate_additional_headers(response: interop.Pointer | interop.Reference<any>, enumerator: (p1: string, p2: string) => boolean): boolean;

declare function nw_ws_response_get_selected_subprotocol(response: interop.Pointer | interop.Reference<any>): string;

declare function nw_ws_response_get_status(response: interop.Pointer | interop.Reference<any>): nw_ws_response_status_t;

declare const enum nw_ws_response_status_t {

	nw_ws_response_status_invalid = 0,

	nw_ws_response_status_accept = 1,

	nw_ws_response_status_reject = 2
}

declare const enum nw_ws_version_t {

	nw_ws_version_invalid = 0,

	nw_ws_version_13 = 1
}
